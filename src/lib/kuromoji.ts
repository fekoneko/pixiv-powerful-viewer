import kuromoji, { IpadicFeatures, Tokenizer } from 'kuromoji';

export const ipadicTokenizer = new Promise<Tokenizer<IpadicFeatures>>((resolve, reject) =>
  kuromoji.builder({ dicPath: 'ipadic' }).build((_error, tokenizer) => {
    if (_error) return reject(_error);
    resolve(tokenizer);
  }),
);
