import camelcaseKeys from 'camelcase-keys';
import ToneAnalyzerV3 from 'ibm-watson/tone-analyzer/v3';
import { IamAuthenticator } from 'ibm-watson/auth';
import { IBM_TONE_API_KEY, IBM_TONE_API_URL } from '../util/secrets';
import { PostDocument, ToneCategory } from '../types';

const toneAnalyzer = new ToneAnalyzerV3({
  authenticator: new IamAuthenticator({ apikey: IBM_TONE_API_KEY }),
  version: '2016-05-19',
  serviceUrl: IBM_TONE_API_URL,
});

export const analyzePostTone = async (
  posts: PostDocument[],
): Promise<string> => {
  let message = 'Good to see you here! Make an EMPOWERing post now! 🤩';

  if (posts.length > 0) {
    const { result } = await toneAnalyzer.tone({
      toneInput: posts[0].caption,
      contentType: 'text/plain',
    });

    const toneCategories = result.document_tone.tone_categories;

    if (toneCategories) {
      const emotionalTones = toneCategories.find(
        (category) => category.category_id === 'emotion_tone',
      );

      const maxEmotionalTone = emotionalTones?.tones.sort((a, b) =>
        a.score < b.score ? 1 : -1,
      )[0];

      if (maxEmotionalTone) {
        switch (maxEmotionalTone.tone_id) {
          case 'anger':
            message =
              '“Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else; you are the one who gets burned.” 🥺';
            break;
          case 'disgust':
            message =
              '“Happiness comes from peace. Peace comes from indifference.” 🤷‍♀️';
            break;
          case 'fear':
            message =
              '“Have the courage to follow your heart and intuition. They somehow already know what you truly want to become.”';
            break;
          case 'joy':
            message =
              '“A smile is a curve that sets everything straight. Keep Smiling! 😊”';
            break;
          case 'sadness':
            message =
              "“Don't be sad and don't give up on your dreams. Dreams will come true one day. There's no person as beautiful as a person who dreams” 🦋";
            break;
        }

        return message;
      }
    }
  }

  return message;
};

export const analyzeResponse = async (
  answer: string,
): Promise<ToneCategory[]> => {
  try {
    const { result } = await toneAnalyzer.tone({
      toneInput: answer,
      contentType: 'text/plain',
    });

    const toneCategories = result.document_tone.tone_categories;

    if (toneCategories) {
      const tones = camelcaseKeys(toneCategories, { deep: true });
      return (tones as never) as ToneCategory[];
    } else {
      throw new Error();
    }
  } catch (err) {
    throw err;
  }
};
