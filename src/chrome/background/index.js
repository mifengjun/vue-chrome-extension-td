import installReload from "./hmr";
import installRequest from "./request";
import config from "../../config";
import axios from "axios";
import { getDate } from "../../utils/date";

// 安装热刷新功能
installReload();
installRequest();
console.log("chrome extension ...");


// 监听长连接
chrome.runtime.onConnect.addListener(function (connect) {
    if (connect.name === 'chrome-extendsion-connect') {
        connect.onMessage.addListener(function (request) {
            switch (request.functionName) {
                case "getOvertimeClockIn":
                    getOvertimeClockIn(connect);
                    break;
                case "overtimeClockIn":
                    overtimeClockIn(connect);
                    break;
                default:
                    break;
            }

        });
    }
});

async function getOvertimeClockIn(connect) {
    var url = config.oaHost + "/api/proc/list/sent?pageNum=1&pageSize=20&filter=" + config.overtimeClockInFilter + "&start=" + getDate() + "&end=" + getDate() + "&pending=false"
    var res = await axios.get(url);
    connect.postMessage({name: 'getOvertimeClockIn', data: res});
}

async function overtimeClockIn(connect) {
    var res;
    var user = await getCurrentUser();
    if (!user.data.success) {
        res = user;
    } else {
        var url = config.oaHost + "/api/proc/list/sent?pageNum=1&pageSize=20&filter=" + config.overtimeClockInFilter + "&start=" + getDate() + "&end=" + getDate() + "&pending=false"
        res = await axios.get(url);
        if (res.data.success && res.data.data.list.length === 0) {
            var paramData = {"reason": "加班", "workcode": user.data.data.jobNumber};
            var data = {"flowKey": "jbsq", "version": 37, "formKey": "default", "data": JSON.stringify(paramData)};
            res = await axios.post(config.oaHost + "/api/proc/ru/submit", data);
        }
        // 中止通知
        clearInterval(notice);
    }
    connect.postMessage({name: 'overtimeClockIn', data: res});
}

async function getCurrentUser() {
    return await axios.get(config.oaHost + "/api/auth/current");
}



function notification() {
    var url = config.oaHost + "/api/proc/list/sent?pageNum=1&pageSize=20&filter=" + config.overtimeClockInFilter + "&start=" + getDate() + "&end=" + getDate() + "&pending=false"
    axios.get(url).then(res => {
        if (res.data.success && res.data.data.list.length === 0) {
            var notification = new Notification('嘿！', {
                body: '加班辛苦了，记得打卡哦',
                icon: '/assets/clock.png',// "图标路径，若不指定默认为favicon"
            });

            notification.addEventListener('click', function () {
                //window.open("chrome-extension://" + chrome.runtime.id + "/newtab.html")
                //overtimeClockIn()
                notification.close()
            });
        }
    });
}

notification();

var notice;
var flag = true;
// 超过配置的时间后，开始检测是否打开
if (new Date().getHours() >= config.Hour && flag) {
    notice = setInterval(() => {
        notification()
    }, 60000 * 30);
}