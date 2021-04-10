import { exec, execSync } from 'child_process';
import { Router, Request, Response, NextFunction } from 'express';
import { promises as fs, existsSync } from 'fs';
import path from 'path';
import createError from 'http-errors';
import _ from 'lodash';
import { ApplicationRepo, JobRepo } from '../models';
import { ApplicationStatus, Resume } from '../types';
import { analyzeResponse } from '../util/analyze-tone';
import logger from '../util/logger';
import Questions from '../util/hr-questions';
const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  if (!req?.session?.user) {
    return next(createError(401, 'You must be logged in to view this page'));
  }

  try {
    let filter: any;

    if (req.session.user.isAdmin) {
      filter = {};
    } else {
      const applications = await ApplicationRepo.findAll({
        by: req.session.user._id,
      });
      filter = {
        _id: {
          $nin: applications.map((application) => application.for),
        },
      };
    }

    const jobs = await JobRepo.findAll(filter);

    res.render('job/index', {
      user: req?.session?.user,
      jobs,
    });
  } catch (err) {
    logger.error('Error fetching jobs', { err });
    next(createError(500, 'Error fetching jobs'));
  }
});

router.get(
  '/create',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user?.isAdmin) {
      next(createError(401, 'You must be an admin to view this page'));
    }

    res.render('job/create', {
      user: req?.session?.user,
    });
  },
);

router.post(
  '/create',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      next(createError(401, 'You must logged in to view this page'));
    }

    try {
      const {
        companyName,
        companyAddress,
        companyAbout,
        role,
        skills,
        pay,
        description,
      } = req.body;

      await JobRepo.createOne({
        company: {
          name: companyName,
          address: companyAddress,
          about: companyAbout,
        },
        role,
        skills: skills
          .split(',')
          .map((skill: string) => skill.toLowerCase().trim()),
        pay,
        description,
        hiring: false,
      });

      return res.status(200).redirect('/');
    } catch (err) {
      logger.error('Error creating job post', { err });
      next(createError(500, 'Error creating job post'));
    }
  },
);

router.get(
  '/apply/:jobId',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      return next(
        createError(401, 'You need to be logged in to view this page'),
      );
    } else if (req.session.user.isAdmin) {
      return next(createError(401, 'Admins cannot apply for a job position'));
    }

    try {
      const { user } = req.session;

      const applicationExists = await ApplicationRepo.findOne({
        by: user._id,
        for: req.params.jobId,
      });

      if (applicationExists) {
        return next(createError(401, 'You have already applied for this job'));
      }

      const job = await JobRepo.findOne({ _id: req.params.jobId });

      const questions = _.sampleSize(Questions, 3);

      res.render('job/apply', {
        job,
        user,
        questions,
      });
    } catch (err) {
      logger.error('Error fetching job application', { err });
      next(createError(500, 'Error fetching job application'));
    }
  },
);

router.post(
  '/apply/:jobId',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      return next(
        createError(401, 'You need to be logged in to view this page'),
      );
    } else if (req.session.user.isAdmin) {
      return next(createError(401, 'Admins cannot apply for a job position'));
    }

    try {
      const { user } = req.session;
      const {
        name,
        email,
        phone,
        summary,
        address,
        city,
        region,
        countryCode,
        postalCode,
        company,
        position,
        startDate,
        endDate,
        workSummary,
        highlights,
        institution,
        area,
        studyType,
        studyStartDate,
        studyEndDate,
        gpa,
        skillName,
        level,
        keywords,
        courses,
        questions,
        answers,
      } = req.body;

      const resume: Resume = {
        basics: {
          name,
          email,
          phone,
          location: {
            address,
            city,
            region,
            countryCode,
            postalCode,
          },
          summary,
        },
        work: [],
        education: [],
        skills: [],
      };

      if (Array.isArray(company)) {
        for (let i = 0; i < company.length; i++) {
          resume.work.push({
            company: company[i],
            position: position[i],
            startDate: startDate[i],
            endDate: endDate[i],
            summary: workSummary[i],
            highlights: highlights[i].replace(/\r/g, '').split('\n'),
          });
        }
      } else if (typeof company === 'string') {
        resume.work.push({
          company: company,
          position: position,
          startDate: startDate,
          endDate: endDate,
          summary: summary,
          highlights: highlights,
        });
      }

      if (Array.isArray(institution)) {
        for (let i = 0; i < institution.length; i++) {
          resume.education.push({
            institution: institution[i],
            studyType: studyType[i],
            startDate: studyStartDate[i],
            endDate: studyEndDate[i],
            area: area[i],
            gpa: gpa[i],
            courses: courses[i].replace(/\r/g, '').split('\n'),
          });
        }
      } else if (typeof institution === 'string') {
        resume.education.push({
          institution: institution,
          studyType: studyType,
          startDate: studyStartDate,
          endDate: studyEndDate,
          area: area,
          gpa: gpa,
          courses: courses.replace(/\r/g, '').split('\n'),
        });
      }

      if (Array.isArray(skillName)) {
        for (let i = 0; i < skillName.length; i++) {
          resume.skills.push({
            name: skillName[i],
            level: level[i],
            keywords: keywords[i].split(','),
          });
        }
      } else if (typeof skillName === 'string') {
        resume.skills.push({
          name: skillName,
          level: level,
          keywords: keywords.split(','),
        });
      }

      const resumeDirectory = path.resolve(
        path.join(
          process.cwd(),
          'src',
          'public',
          'assets',
          'resumes',
          `${req.params.jobId}-${user.username}`,
        ),
      );

      const directoryExists = await existsSync(resumeDirectory);

      if (!directoryExists) {
        await fs.mkdir(resumeDirectory, {
          recursive: true,
        });
      }

      const resumeFilePath = path.resolve(
        path.join(resumeDirectory, 'resume.json'),
      );

      await fs.writeFile(
        resumeFilePath,
        JSON.stringify(
          {
            meta: { theme: 'onepage' },
            ...resume,
          },
          null,
          2,
        ),
      );

      execSync('npx resume export resume.pdf', {
        cwd: resumeDirectory,
      });

      const [tones1, tones2, tones3] = await Promise.all([
        analyzeResponse(answers[0]),
        analyzeResponse(answers[1]),
        analyzeResponse(answers[2]),
      ]);

      const application = await ApplicationRepo.createOne({
        for: req.params.jobId,
        by: user._id,
        resume: `/assets/resumes/${req.params.jobId}-${user.username}/resume.pdf`,
        responses: _.zipWith(
          [tones1, tones2, tones3],
          questions,
          answers,
          (t, q, a) => {
            return {
              insights: t,
              question: q as string,
              answer: a as string,
            };
          },
        ),
        status: ApplicationStatus.underReview,
      });

      await JobRepo.update(req.params.jobId, {
        $push: {
          applications: application._id,
        },
      });

      await res.redirect('/');
    } catch (err) {
      logger.error('Error fetching job application', { err });
      next(createError(500, 'Error fetching job application'));
    }
  },
);

router.get(
  '/details/:jobId',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req?.session?.user) {
      return next(
        createError(401, 'You need to be logged in to view this page'),
      );
    } else if (!req.session.user.isAdmin) {
      return next(
        createError(401, 'You need to be an admin to view this page'),
      );
    }

    const applications = await ApplicationRepo.findAll({
      for: req.params.jobId,
    });
    const job = await JobRepo.findOne({ _id: req.params.jobId });

    res.render('job/detail', {
      job,
      user: req.session.user,
      applications,
    });
    try {
    } catch (err) {
      logger.error('Error fetching job details', { err });
      next(createError(500, 'Error fetching job details'));
    }
  },
);

export default router;
