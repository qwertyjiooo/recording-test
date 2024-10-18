import axios from 'axios';
import CryptoJS from 'crypto-js';
import BMF from 'browser-md5-file';
import { ElMessage } from 'element-plus';

export async function sendMessages(messagesList) {
    const appkey = 'a5vd6ltghqrgdtyxg5g6unfxhhpzkto2ejinogyw';
    const secret = '55414277803e08ffe6dbe852cf0ae2d7';
    const udid = 'aff6b5f6-51b7-f4ab-dae4-0781da41f939';
    const url = 'https://unigpt-api.hivoice.cn/rest/v1.1/chat/completions';
    const millis = Math.round(new Date().getTime());
    const sign = CryptoJS.SHA256(appkey + udid + millis.toString() + secret).toString(CryptoJS.enc.Hex).toUpperCase();
    console.log('messagesList', messagesList);
    const contentStr = messagesList.join('\n');
    console.log('contentStr', contentStr);
    const headers = {
        appkey,
        udid,
        timestamp: millis.toString(),
        sign,
    };
    const body = {
        model: 'unigpt-3.5',
        // temperature: 2,
        messages: { content: contentStr },
    };
    console.log('body', body);

    try {
        const response = await axios.post(url, body, { headers });
        console.log('response', response);
        const value = response.data.result.choices[0].message.content;
        console.log('value', value);
        return value;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
export function processDictToArray(titleVoList) {
    const tempitems = [];
    titleVoList.forEach((element) => {
        let pathStr = '';
        let nameStr = '';
        if (element.type === 1) {
            pathStr = `/Parties-page?id=${element.bookVo.id}`;
            nameStr = `${element.title}`;
        } else if (element.type === 2) {
            pathStr = `/FollowUpRecords-page?id=${element.bookVo.id}`;
            nameStr = `${element.title}`;
        } else if (element.type === 3) {
            pathStr = '/AcceptanceRegistrationForm-page';
            nameStr = element.title;
        } else if (element.type === 4) {
            pathStr = '/MediationAgreement-page';
            nameStr = element.title;
        }
        const temp1 = {
            name: nameStr,
            path: pathStr,
            select: false,
            recordInfo: element,
        };
        tempitems.push(temp1);
    });
    tempitems.push({ name: '打印预览', path: '/Print-preview', select: false });
    return tempitems;
}
export default {
    processDictToArray,
    sendMessages,
};
