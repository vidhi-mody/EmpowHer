import mongoose from 'mongoose';

export interface Like {
  by: UserDocument['_id'] | UserDocument;
  onPost: PostDocument['_id'] | PostDocument[];
  createdAt?: string;
}

export interface LikeDocument extends Like, mongoose.Document {}

export interface Comment extends Like {
  text: string;
}

export interface CommentDocument extends Comment, mongoose.Document {}

export interface Post {
  comments?: CommentDocument['_id'][] | CommentDocument[];
  likes?: LikeDocument['_id'][] | LikeDocument[];
  author: UserDocument['_id'] | UserDocument;
  staticUrl?: string;
  type?: string;
  caption: string;
  category: string;
  createdAt?: string;
  isHateSpeech?: boolean;
}

export interface PostDocument extends Post, mongoose.Document {}

export interface Meet {
  eventName: string;
  eventDescription: string;
  eventDate: string;
  eventTime: string;
  eventLink: string;
  author: UserDocument['_id'] | UserDocument;
}

export interface MeetDocument extends Meet, mongoose.Document {}
export interface Message {
  text: string;
  by: UserDocument['_id'] | UserDocument;
  createdAt?: string;
}

export interface MessageDocument extends Message, mongoose.Document {}

export interface ChatRoom {
  users: UserDocument[] | UserDocument['_id'][];
  messages: MessageDocument['_id'][] | MessageDocument[];
  createdAt: string;
}

export interface ChatRoomDocument extends ChatRoom, mongoose.Document {}

export enum ApplicationStatus {
  underReview = 'under review',
  selected = 'selected',
  rejected = 'rejected',
}

export interface Tone {
  toneId: string;
  toneName: string;
  score: number;
}
export interface ToneCategory {
  categoryId: string;
  categoryName: string;
  tones: Tone[];
}

export interface ResponseInsight {
  question: string;
  answer: string;
  insights: ToneCategory[];
}

export interface Application {
  for: JobDocument['_id'] | JobDocument;
  by: UserDocument['_id'] | UserDocument;
  status: ApplicationStatus;
  responses: ResponseInsight[];
  resume: string;
  createdAt?: string;
}

export interface ApplicationDocument extends Application, mongoose.Document {}

export interface Company {
  name: string;
  address: string;
  about: string;
}

export interface Job {
  company: Company;
  role: string;
  skills: string[];
  description: string;
  pay: string;
  hiring: boolean;
  applications?: ApplicationDocument['_id'][] | ApplicationDocument[];
  createdAt?: string;
}

export interface JobDocument extends Job, mongoose.Document {}

export interface WorkDetails {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights?: string[];
}

export interface EducationDetails {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate?: string;
  gpa: string;
  courses?: string[];
}

export interface Skill {
  name: string;
  level: string;
  keywords: string[];
}

export interface BasicDetails {
  name: string;
  email: string;
  phone: string;
  summary: string;
  location: {
    address: string;
    region: string;
    city: string;
    postalCode: string;
    countryCode: string;
  };
}
export interface Resume {
  basics: BasicDetails;
  work: WorkDetails[];
  education: EducationDetails[];
  skills: Skill[];
}

export interface User {
  accessToken: string;
  refreshToken: string;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  createdAt?: string;
  isAdmin?: boolean;
}

export interface UserDocument extends mongoose.Document, User {}
