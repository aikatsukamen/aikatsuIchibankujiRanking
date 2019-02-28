"use strict";
/*************************************
 * 共通で使えそうなやつら
 *************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const csvParse = require("csv-parse/lib/sync");
/**
 * Dateオブジェクトを、YYYY/MM/DD HH:MM形式にする
 * @param date
 */
exports.converDateToStr = (date) => {
    const year = `0000${date.getFullYear()}`.slice(-4);
    const month = `00${date.getMonth() + 1}`.slice(-2);
    const day = `00${date.getDate()}`.slice(-2);
    const hour = `00${date.getHours()}`.slice(-2);
    const minute = `00${date.getMinutes()}`.slice(-2);
    return `${year}/${month}/${day} ${hour}:${minute}`;
};
/**
 * イベントデータを初期化する
 */
exports.clearEventData = () => {
    global.eventPointBorder = {
        date: null,
        eventId: NaN,
        name: '',
        result: []
    };
    global.highScoreBorder = {
        date: null,
        eventId: NaN,
        name: '',
        result: []
    };
};
/**
 * globでファイル検索
 * @param pattern 検索パターン
 */
exports.find = (pattern) => {
    return new Promise((resolve, reject) => {
        glob(pattern, (err, files) => {
            if (err)
                reject(err);
            resolve(files);
        });
    });
};
/**
 * awaitで囲いたいreadFile
 * @param filePath ファイルのパス
 * @return ファイルバッファ
 */
exports.readFileBin = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            resolve(data);
        });
    });
};
/**
 * awaitで囲いたいreadFile
 * @param src コピー元ファイルのパス
 * @param dst コピー先ファイルのパス
 * @throws コピーで何かあった
 */
exports.copyFile = (src, dst) => {
    return new Promise((resolve, reject) => {
        fs.copyFile(src, dst, err => {
            if (err)
                reject();
            resolve();
        });
    });
};
/**
 * awaitで囲いたいremove
 * @param src 削除対象のファイルのパス
 * @throws 削除で何かあった
 */
exports.removeFile = (src) => {
    return new Promise((resolve, reject) => {
        fs.remove(src, err => {
            if (err)
                reject();
            resolve();
        });
    });
};
/**
 * awaitで囲いたいfs.exists
 * @param fullPath ファイルの絶対パス
 * @return true:存在する false:しない
 */
exports.isFileExist = (fullPath) => {
    return new Promise((resolve, reject) => {
        fs.exists(fullPath, (exists) => {
            resolve(exists);
        });
    });
};
/**
 * awaitで囲いたいreadFile
 * @param filePath ファイルのパス
 * @param code 文字コード
 * @return 読み込んだ文字列
 */
exports.readFileText = (filePath, code) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, code, (err, data) => {
            resolve(data);
        });
    });
};
/**
 * ヘッダ無しCSVファイルを読み込み、ヘッダをつけて返す
 * @param filepath ファイルパス
 * @param header ヘッダ文字
 */
exports.readCSVFilePlusHeader = async (filepath, header) => {
    const data = await exports.readFileText(filepath, 'utf-8');
    const parse = csvParse(data, {
        columns: false,
        skip_empty_lines: true
    });
    const retArry = [];
    for (const row of parse) {
        const elem = {};
        if (!row)
            continue;
        for (let i = 0; i < header.length; i++) {
            const colName = header[i];
            elem[colName] = row[i];
        }
        retArry.push(elem);
    }
    return retArry;
};
/**
 * テキストファイルに追記
 * @param filepath ファイルパス
 * @param dataStr 追記する文字
 */
exports.appendTextFile = async (filepath, dataStr) => {
    return new Promise((resolve, reject) => {
        fs.appendFile(filepath, dataStr, err => {
            if (err)
                reject(err);
            resolve();
        });
    });
};
/**
 * ファイルをバイナリとして書き込む
 * @param filename ファイル名
 * @param buffer
 */
exports.writeFileFromBuffer = async (filename, buffer) => {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(path.resolve(filename));
        writeStream.write(buffer, 'binary');
        writeStream.on('finish', async () => {
            resolve();
        });
        writeStream.end();
    });
};
//# sourceMappingURL=util.js.map