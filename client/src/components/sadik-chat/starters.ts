/** Starter questions for an empty conversation: one per theme the corpus covers well, listed like an index (topic + question). */
import type { SourceType } from './types';

/** `type` picks the site's content-type colour for the topic pill (the same pills as on the site's pages). */
export const STARTERS: readonly { topic: string; question: string; type: SourceType }[] = [
  { topic: 'הרמב״ם', question: 'מה ייחודה של שיטת הרמב״ם בהבנת טעמי המצוות?', type: 'video' },
  { topic: 'ידיעה ובחירה', question: 'איך מתיישבות ידיעת האל ובחירתו החופשית של האדם?', type: 'playlist' },
  { topic: 'קרשקש', question: 'במה חלק רבי חסדאי קרשקש על הרמב״ם?', type: 'writing' },
  { topic: 'הכוזרי', question: 'מדוע בחר רבי יהודה הלוי בכוזרי בחבר ולא בפילוסוף?', type: 'blog' },
  { topic: 'קבלה ופילוסופיה', question: 'האם הקבלה והפילוסופיה סותרות זו את זו?', type: 'term' },
  { topic: 'הלכה ושינוי', question: 'האם מותר לשנות את ההלכה כשהמציאות משתנה?', type: 'responsa' },
];
