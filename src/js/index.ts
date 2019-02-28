/*************************************
 * 一番くじランキング
 *************************************/

import logger from './logger';
import * as cheerio from 'cheerio';
import * as rp from 'request-promise';
import { CronJob } from 'cron';

// 起動時メッセージ
logger.console.info('にょわー☆');

const getRanking = async () => {
  try {
    const jar = rp.jar();

    // ランキングページに取りに行く
    // 1ページ目は9位までしか表示されない
    const getOpt = {
      method: 'GET',
      uri: 'https://bpnavi.jp/s/elec/aikatsu_p5/item_rankings',
      jar,
      headers: {
        Host: 'bpnavi.jp',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Mobile Safari/537.36'
      }
    };
    logger.access.info(JSON.stringify(getOpt, null, '  '));
    const response1 = await rp(getOpt);
    // console.log(response1);
    const $1 = cheerio.load(response1);
    const token = $1('[name=csrf-token]').attr('content');

    // 2ページ目以降はPOSTで取る
    const options = {
      method: 'POST',
      uri: 'https://bpnavi.jp/s/elec/aikatsu_p5/item_rankings/more',
      jar,
      // followRedirects: true,
      headers: {
        DNT: 1,
        Host: 'bpnavi.jp',
        Origin: 'https://bpnavi.jp',
        Pragma: 'no-cache',
        Referer: 'https://bpnavi.jp/s/elec/aikatsu_p5/item_rankings',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Mobile Safari/537.36',
        'X-CSRF-Token': token,
        'X-Requested-With': 'XMLHttpRequest'
      },
      json: true,
      form: {
        page: 2
      }
    };
    logger.access.info(JSON.stringify(options, null, '  '));
    const response2 = await rp(options);
    options.form.page = 3;
    logger.access.info(JSON.stringify(options, null, '  '));
    const response3 = await rp(options);
    options.form.page = 4;
    logger.access.info(JSON.stringify(options, null, '  '));
    const response4 = await rp(options);

    const $2 = cheerio.load(`<table><tbody>${response2.attachmentPartial}${response3.attachmentPartial}${response4.attachmentPartial}</tbody></table>`);

    const rankList: {
      rank: string;
      name: string;
    }[] = [];

    // スクレイピング
    $1('#ranking td').each((index, value) => {
      const rank = $1(value)
        .find('.rank')
        .text()
        .trim()
        .replace('位', '');
      const name = $1(value)
        .find('.name_vote')
        .text()
        .trim();
      rankList.push({ rank, name });
    });
    $2('td').each((index, value) => {
      const rank = $2(value)
        .find('.rank')
        .text()
        .trim()
        .replace('位', '');
      const name = $2(value)
        .find('.name_vote')
        .text()
        .trim();
      if (rank !== '') rankList.push({ rank, name });
    });

    // 結果をアップロード
    logger.system.log(JSON.stringify(rankList, null, '  '));
    const resultOption = {
      method: 'POST',
      url: 'https://script.google.com/macros/s/AKfycbx_5LNDwQoA3r60vZzceNJMY49DxxHxfW3cnC9K1P8nYLpHaxeN/exec',
      json: true,
      body: {
        date: new Date(),
        rankList
      }
    };
    logger.access.info(JSON.stringify(resultOption, null, '  '));
    const response = await rp(resultOption);
  } catch (e) {
    logger.system.error(e);
  }
};

getRanking();

new CronJob('*/15 * * * *', getRanking).start();

/**
 * シャットダウン処理
 *
 * FIXME: pm2経由だと上手く動かない
 */
const shutdown = () => {
  logger.system.info('終了信号を受信しました。');
  setTimeout(() => {
    process.exit(0);
  }, 1500);
};
// 終了信号を受信
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
