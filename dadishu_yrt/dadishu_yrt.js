var game_time = 20, //倒计时
    game_value = 0, //得分
    jg_time = 10 * 100, // 间隔时间
    tl_time = 10 * 100, // 停留时间
    begin_count = 67,
    mouse_count = 9,
    begin_speed = 30,
    show_speed = 60,
    hide_speed = 60;

var is_start = false,
    mouse_replay,
    is_replay = false;

// 地鼠
// 地鼠状态（0消失，1出现过程，2出现完成，3时间到消失过程，4被打）
var data = [],
    mouse_state = [];
for (var i = 1; i < 10; i++) {
    data.push("dishu" + i);
    mouse_state.push(0);
}

function getPath(idx, type) {
    return "dadishu_yrt.fbm/" + type + "/" + type + "_" + idx + ".png";
}

function getIdx(nodeId) {
    return nodeId.substring(5, 6) - 1;
}

function getRandom(min, max) {
    var l = max + 1 - min;
    return Math.floor(Math.random() * l + min);
}

function getNum(min, max) {
    tl_time = getRandom(min, max) * 100;
    jg_time = getRandom(min, max) * 100;
}

function showValue(left, right, type) {
    var value = game_value.toString().split("");
    if (game_value <= 9) {
        AR.set_texture(left, getPath(0, type), 0);
        AR.set_texture(right, getPath(value[0], type), 0);
    } else {
        AR.set_texture(left, getPath(value[0], type), 0);
        AR.set_texture(right, getPath(value[1], type), 0);
    }
}

function changeTime() {
    getNum(10, 10);
    var tl = 0
    for (var i = 0; i < Math.floor(game_time / 4); i++) {
        AR.setTimeout(function () {
            getNum(9 - tl, 10 - tl);
            AR.log(tl_time, jg_time);
            tl++;
        }, i * 5000);
    }
}

function callbackFun(texIdx, nodeId, texCount, type, speed) {
    var idx = getIdx(nodeId);
    AR.setTimeout(function () {
        AR.set_texture(nodeId, getPath(texIdx, type), 0);
        if (type == "begin" && AR.remove_tex_cache && texIdx > 0) {
            AR.remove_tex_cache(getPath(texIdx - 1, type));
        }
        texIdx++;
        if (type == "begin" && texIdx == 60) {
            AR.set_visible("pPlane_kaishi", true);
            // 开始按钮
            creaAnimation("pPlane_kaishi", "startAnim1", 2, 6, "start");
        }
        if (texIdx <= texCount && mouse_state[idx] != 4) {
            callbackFun(texIdx, nodeId, texCount, type, speed);
        }
        if (texIdx >= texCount && texCount == mouse_count) {
            if (mouse_state[idx] == 1) {
                mouse_state[idx] = 2;
            } else if (mouse_state[idx] == 3) {
                mouse_state[idx] = 0;
            }
        }
    }, 1000 / speed);
}
// 被打状态消失的动画序列帧动画
function callbackFun2(texIdx, nodeId, texCount, type, speed) {
    var idx = getIdx(nodeId);
    AR.setTimeout(function () {
        AR.set_texture(nodeId, getPath(texIdx, type), 0);
        texIdx++;
        if (texIdx <= texCount) {
            callbackFun2(texIdx, nodeId, texCount, type, speed);
        }
        if (texIdx >= texCount && mouse_state[idx] == 4) {
            mouse_state[idx] = 0;
        }
    }, 1000 / speed);
}

// 序列帧动画()
function frameAnimation(nodeId, texCount, type, speed) {
    var idx = getIdx(nodeId);
    var texIdx = 0;
    if (texCount == mouse_count) {
        if (mouse_state[idx] == 0) {
            mouse_state[idx] = 1;
        }
        if (mouse_state[idx] == 2) {
            mouse_state[idx] = 3;
        }
    }
    callbackFun(texIdx, nodeId, texCount, type, speed);

}
// 序列帧动画(被打状态消失的动画)
function frameAnimation2(nodeId, texCount, type, speed) {
    var idx = getIdx(nodeId);
    var texIdx = 0;
    callbackFun2(texIdx, nodeId, texCount, type, speed);
}

// 创建运动
function creaAnimation(nodeId, animId, animaType, keyCount, type) {
    var keyTimes = [];
    var keyValue = [];
    if (type == "start") {
        for (var i = 0; i < keyCount; i++) {
            keyTimes.push(i * 50);
            keyValue.push((i + 1) * 0.1 + 0.6);
        }
        keyValue[keyCount - 1] = 1;
    } else if (type == "time") {
        for (var i = 0; i < keyCount; i++) {
            keyTimes.push(i * game_time * 1000);
        }
        if (nodeId == "huakuai") {
            keyValue = [4, -4.2];
        }
        if (nodeId == "jindu") {
            keyValue = [0, -9];
        }
    } else if (type == "timeUp") {
        for (var i = 0; i < keyCount; i++) {
            keyTimes.push(i * 150);
            keyValue.push(i * 0.5)
        }
    }
    AR.create_animation(
        animId,
        nodeId,
        animaType,
        keyCount,
        keyTimes,
        keyValue,
        AR.animation.CURVE_LINEAR
    );
    AR.play(animId + '#Default', 1);
}

function mouseRun() {
    var index = getRandom(0, 8);
    if (mouse_state[index] == 0) {
        // AR.log("现在出现的地鼠： " + data[index]);
        frameAnimation(data[index], mouse_count, "show", show_speed);
        AR.setTimeout(function () {
            // AR.log(" 时间到 " + data[index] + " 的状态：" + mouse_state[index]);
            if (mouse_state[index] == 2) {
                // AR.log(" 地鼠消失 " + data[index]);
                frameAnimation(data[index], mouse_count, "smilehide", hide_speed);
            } else return;
        }, mouse_count * 1000 / show_speed + tl_time);
    } else return;
}
//地鼠出现方法
function mouseShow() {
    var showNum = getRandom(1, 3);
    for (var i = 0; i < showNum; i++) {
        AR.setTimeout(function () {
            mouseRun()
        }, getRandom(0, 3) * 100)
    }
    mouse_replay = AR.setTimeout(function () {
        mouseShow();
    }, jg_time);
}

// 游戏开始
function gameStart() {
    is_start = true;
    // is_replay = true;
    game_value = 0;
    showValue("pPlane02_defen01", "pPlane02_defen02", "number")
    for (var i = 0; i < 9; i++) {
        mouse_state[i] = 0;
        AR.set_texture(data[i], "dadishu_yrt.fbm/mouse.png", 0);
    }
    AR.set_visible("start", false);
    AR.set_visible("main", true);
    AR.set_visible("end", false);
    // 倒计时
    creaAnimation("huakuai", "timeAnim1", 10, 2, "time");
    creaAnimation("jindu", "timeAnim2", 10, 2, "time");
    changeTime();
    mouseShow();
    AR.setTimeout(function () {
        gameOver();
        AR.log("游戏结束");
    }, game_time * 1000);
}
// 打地鼠
function gamePlay(nodeId) {
    var idx = getIdx(nodeId);
    if (is_start && (mouse_state[idx] == 1 || mouse_state[idx] == 2 || mouse_state[idx] == 3)) {
        mouse_state[idx] = 4;
        // 判断点击的节点是否为正在展示的节点
        for (var i = 0; i < 10; i++) {
            if (nodeId === data[i]) {
                game_value++;
                AR.log("打中地鼠 : " + nodeId + " 分数 = " + game_value);
                showValue("pPlane02_defen01", 'pPlane02_defen02', "number");
                frameAnimation2(data[idx], mouse_count, "cryhide", hide_speed);
            }
        }
        return false;
    }
}
// 游戏结束
function gameOver() {
    is_start = false;
    for (var i = 0; i < 9; i++) {
        mouse_state[i] = 0;
        AR.set_texture(data[i], "dadishu_yrt.fbm/mouse.png", 0);
    }
    AR.clearTimeout(mouse_replay);
    AR.set_visible("main", false);
    AR.set_visible("end", true);
    // 时间到
    creaAnimation("end", "timeUpAnim1", 2, 3, "timeUp");
    creaAnimation("end", "timeUpAnim2", 3, 3, "timeUp");
    showValue("pPlane03_defen03", 'pPlane03_defen02', "num");
};

AR.onload = function () {
    // 设置场景初始进入的可见性
    // AR.set_visible("start", false);
    AR.set_visible("main", false);
    AR.set_visible("end", false);
    AR.set_visible("pPlane_kaishi", false);

    // 调整场景内模型的位置
    AR.translate('huakuai', 3, 0.1, 0);
    AR.translate('jindu', 3, -0.1, 0);
    AR.translate('pPlane_jiangli', 0, -1, 0);
    AR.translate('pPlane_zaiwan', 0, -1.3, 0);
    AR.scale('pPlane_jiangli', 1, 0.85, 1);
    AR.scale('pPlane_zaiwan', 1, 0.85, 1);

    AR.translate('pPlane03_defen03', 0.4, -1.2, 0);
    AR.translate('pPlane03_defen02', -0.4, -1.2, 0);
    AR.scale("pPlane03_defen03", 1.4, 1.5, 1);
    AR.scale("pPlane03_defen02", 1.4, 1.5, 1);

    for (var i = 0; i < 9; i++) {
        // AR.set_texture(data[i], getPath(0, "smilehide"))
        AR.set_visible(data[i], true);
        AR.translate(data[i], 0.4, 0.2, 0);
        AR.scale(data[i], 1.2, 1, 1);
    }

    // 开始
    frameAnimation("pPlane_bg01", begin_count, "begin", begin_speed);

};

AR.onclick = function (nodeId, x, y) {
    gamePlay(nodeId);
    if (nodeId == "pPlane_kaishi" || nodeId == "pPlane_zaiwan") {
        gameStart();
    } else if (nodeId == "pPlane_jiangli") {
        AR.open_url('https://www.arbaseworld.com/');
    }
};