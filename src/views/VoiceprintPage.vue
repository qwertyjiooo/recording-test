<template>
    <el-button size="large" type="primary" @click="createGroup">创建组</el-button>
    <el-button size="large" type="primary" @click="findFeatureListByGroupId">声纹列表</el-button>
    <el-upload :multiple="false" :show-file-list="false" :accept="'.mp3,.wav'"
        :http-request="(rawFile) => uploadFileToOss(rawFile, index)">
        <el-button size="large" type="primary">点击上传</el-button>
    </el-upload>
</template>

<script>
import { ElMessage } from 'element-plus';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const secret = '55414277803e08ffe6dbe852cf0ae2d7';
const appkey = 'a5vd6ltghqrgdtyxg5g6unfxhhpzkto2ejinogyw';
const userid = 'aff6b5f6-51b7-f4ab-dae4-0781da41f939';
const groupId = 'aibilu048a3ba3-a5f1-443a-aad1-932b109bf360';
const path = 'http://ai-vpr.hivoice.cn/vpr/v1';

export default {
    data() {
        return {
            task_id: '',
        };
    },
    methods: {
        async createGroup() {
            const APPID = 'ebe3e2be';
            const APISecret = 'ODA1ZGY1ZDdjZTIzNWNmMWU0YmJhZDNi';
            const APIKey = '2561df037b7b432257340a49a9c6d310';
            const WebAPIpath = 'https://api.xf-yun.com/v1/private/s782b4996';

            const stidx = WebAPIpath.indexOf('://');
            const host = WebAPIpath.slice(stidx + 3);
            const edidx = host.indexOf('/');
            if (edidx <= 0) {
                console.log('url无效:', WebAPIpath);
            }
            const pathStr = host.slice(edidx);
            const hostStr = host.slice(0, edidx);
            console.log('pathStr', pathStr);
            console.log('hostStr', hostStr);

            const now = new Date();
            const dateStr = now.toUTCString();
            console.log('date', dateStr);

            const signatureOrigin = `host: ${hostStr}\ndate: ${dateStr}\nPOST ${pathStr} HTTP/1.1`;
            const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, APISecret).toString(CryptoJS.enc.Base64);
            const authorizationOrigin = `api_key="${APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureSha}"`;
            const authorizationStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));

            const requestUrl = `${WebAPIpath}?host=${hostStr}&date=${dateStr}&authorization=${authorizationStr}`;
            console.log('requestUrl', requestUrl);

            // const appkeyStr = appkey;
            // const timestampStr = Math.round(new Date().getTime());
            const nonceStr = uuidv4();
            // const currentGroupId = `aibilu${nonceStr}`;
            // const signStr = CryptoJS.SHA256(`${appkeyStr}${timestampStr}${secret}${nonceStr}`).toString(CryptoJS.enc.Hex).toUpperCase();
            const createFeatureParam = {
                header: {
                    app_id: APPID,
                    status: 3,
                },
                parameter: {
                    s782b4996: {
                        func: 'createGroup',
                        groupId: nonceStr,
                        groupName: '23424234234',
                        groupInfo: 'AI笔录系统声纹组,AI笔录系统声纹组',
                        createGroupRes: {
                            encoding: 'utf8',
                            compress: 'raw',
                            format: 'json',
                        },
                    },
                },
            };
            axios.post(requestUrl, createFeatureParam, {
                headers: {
                    'content-type': 'application/json',
                    host: 'api.xf-yun.com',
                    appid: APPID,
                },
            }).then((res) => {
                console.log('createGroup', res.data);
            }).catch((error) => {
                console.log('error 2', error);
            });
        },
        async findFeatureListByGroupId() {
            const appkeyStr = appkey;
            const groupIdStr = groupId;
            const timestampStr = Math.round(new Date().getTime());
            const nonceStr = uuidv4();
            const signStr = CryptoJS.SHA256(`${appkeyStr}${timestampStr}${secret}${nonceStr}`).toString(CryptoJS.enc.Hex).toUpperCase();
            const createFeatureParam = {
                appkey: appkeyStr,
                timestamp: timestampStr,
                nonce: nonceStr,
                sign: signStr,
                groupId: groupIdStr,
            };
            const urlStr = `${path}/findFeatureListByGroupId`;
            axios.post(urlStr, createFeatureParam).then((res) => {
                console.log('findFeatureListByGroupId', res.data);
            }).catch((error) => {
                console.log('error 2', error);
            });
        },
        async uploadFileToOss(rawFile, index) {
            const ffmpeg = new FFmpeg();
            await ffmpeg.load();
            await ffmpeg.writeFile('input.wav', rawFile);
            const ffmpegArgs = [
                '-i', 'input.wav', // 输入文件
                '-ar', '16000', // 设置采样率
                '-q:a', '0', // 设置音频质量（0 表示最高质量
                'output.mp3', // 输出文件
            ];
            const exitCode = await ffmpeg.exec(ffmpegArgs);
            if (exitCode !== 0) {
                console.log('FFmpeg conversion failed');
            }
            const mp3Data = await ffmpeg.readFile('output.mp3');
            const reader = new FileReader();
            reader.onloadend = (e) => {
                const originalString = e.target.result;
                console.log('originalString', originalString);
                const commaIndex = originalString.indexOf(',');
                const processedString = originalString.slice(commaIndex + 1);
                console.log('processedString', processedString);
            };
            reader.readAsDataURL(new Blob([mp3Data.buffer], { type: 'audio/mp3' }));
        },
        getAudioSampleRate(file, rawFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                this.decodeAudioData(arrayBuffer, rawFile);
            };
            reader.readAsArrayBuffer(file);
        },
        decodeAudioData(arrayBuffer, rawFile) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(arrayBuffer, (buffer) => {
                if (buffer.sampleRate === 8000 || buffer.sampleRate === 16000) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const originalString = e.target.result;
                        const commaIndex = originalString.indexOf(',');
                        const processedString = originalString.slice(commaIndex + 1);
                        const audiotype = rawFile.file.name
                            .split('.')
                            .pop()
                            .toLowerCase();
                        console.log('audiotype', audiotype);
                        this.upfileActionUrl(audiotype, buffer.sampleRate, processedString);
                    };
                    reader.readAsDataURL(rawFile.file);
                } else {
                    ElMessage('录音的采样率只能是：16000或者8000');
                }
            }, (error) => {
                console.error('Error decoding audio data', error);
            });
        },
        upfileActionUrl(audiotype, sampleRate, base64Data) {
            const appkeyStr = appkey;
            const groupIdStr = groupId;
            const timestampStr = Math.round(new Date().getTime());
            const nonceStr = uuidv4();
            const signStr = CryptoJS.SHA256(`${appkeyStr}${timestampStr}${secret}${nonceStr}`).toString(CryptoJS.enc.Hex).toUpperCase();
            const featureInfo = { username: '张警官', num: '123123123123' };
            const createFeatureParam = {
                appkey: appkeyStr,
                timestamp: timestampStr,
                nonce: nonceStr,
                sign: signStr,
                groupId: groupIdStr,
                featureId: nonceStr,
                featureInfo: JSON.stringify(featureInfo),
                audioData: base64Data,
                audioSampleRate: sampleRate,
                audioFormat: audiotype,
            };
            const urlStr = `${path}/createFeature`;
            axios.post(urlStr, createFeatureParam).then((res) => {
                console.log('createFeature', res.data);
            }).catch((error) => {
                console.log('error 2', error);
            });
        },
        transcribe(audiotype, md5) {
            const lang = 'cn';
            const timestamp = Math.round(new Date().getTime());
            const sssss = `${secret}${appkey}${audiotype}other${lang}${md5}${this.task_id}${timestamp}${userid}${secret}`;
            const signature = CryptoJS.SHA1(sssss).toString().toUpperCase();
            const actiontranscribe = `${path}/utservice/v2/trans/transcribe?userid=${userid}&task_id=${this.task_id}&audiotype=${audiotype}&domain=other&lang=${lang}&md5=${md5}&appkey=${appkey}&timestamp=${timestamp}&signature=${signature}`;
            axios.get(actiontranscribe).then((res) => {
                if (res.data.error_code === 0) {
                    console.log('transcribe', res.data);
                    this.transtext();
                } else {
                    console.log('transcribe 1', res.data.message);
                }
            }).catch((error) => {
                console.log('transcribe 2', error);
            });
        },
        transtext() {
            const timestamp = Math.round(new Date().getTime());
            const sssss = `${secret}${appkey}${this.task_id}${timestamp}${secret}`;
            const signature = CryptoJS.SHA1(sssss).toString().toUpperCase();
            const actiontranscribe = `${path}/utservice/v2/trans/text?task_id=${this.task_id}&appkey=${appkey}&timestamp=${timestamp}&signature=${signature}`;
            axios.get(actiontranscribe).then((res) => {
                if (res.data.error_code === 0) {
                    if (res.data.status === 'done') {
                        if (res.data.error_code === 0) {
                            console.log('识别结果：', res.data.results);
                        }
                    } else {
                        setTimeout(() => {
                            this.transtext();
                        }, 1000);
                    }
                } else {
                    console.log('transtext 1', res.data.message);
                }
            }).catch((error) => {
                console.log('transtext 2', error);
            });
        },

    },
};

</script>

<style scoped>
/* 样式保持不变 */
</style>
