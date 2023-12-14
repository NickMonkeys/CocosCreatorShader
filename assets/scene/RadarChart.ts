import { _decorator, Component, Node, Graphics, Vec2, v2, Color, color, tween, log } from 'cc';
const { ccclass, property } = _decorator;

export interface RadarChartData {
    // 数值
    values: number[];
    // 线款
    lineWidth: number;
    // 线色
    lineColor?: Color;
    // 填充色
    fillColor?: Color;
    // 节点色
    joinColor?: Color;
}

const defaultOptions: RadarChartData = {
    values: [],
    lineWidth: 2,
    lineColor: color(0, 0, 0, 255),
    fillColor: color(255, 255, 255, 80),
    joinColor: color(255, 255, 255, 255),
};

@ccclass('RadarChart')
export class RadarChart extends Component {
    @property(Graphics)
    ctxChart: Graphics = null;

    @property(Graphics)
    ctxValue: Graphics = null;

    private curDatas: RadarChartData[] = [];

    private axle = 3; // 数轴数量
    private axleLv = 3; // 数轴刻度数
    private axleLen = 200; // 数轴长度
    private angles = []; // 数轴角度

    private keepUpdating = false;

    start() {
        this.drawChart(this.axle, this.axleLen, this.axleLv);
        
        const data1: RadarChartData = {
            values: [0.7, 0.9, 0.8],
            lineWidth: 2,
            lineColor: color(255, 0, 0, 255),
            fillColor: color(255/2, 0, 0, 100),
        }
        const data2: RadarChartData = {
            values: [0.3, 0.5, 0.8],
            lineWidth: 2,
            lineColor: color(0, 255, 0, 255),
            fillColor: color(0, 255/2, 0, 100),
        }

        this.curDatas = [data1, data2];
        this.drawValue(this.curDatas);       

    }

    private onClickRandomDraw() {
        const data1: RadarChartData = {
            values: [0.3, 0.5, 0.8],
            lineWidth: 2,
            lineColor: color(255, 0, 0, 255),
            fillColor: color(255/2, 0, 0, 100),
        }
        const data2: RadarChartData = {
            values: [0.7, 0.9, 0.5],
            lineWidth: 2,
            lineColor: color(0, 255, 0, 255),
            fillColor: color(0, 255/2, 0, 100),
        }
        const target = [data1, data2];
        for (let i = 0; i < target.length; i++) {
            const values = target[i].values;
            for (let j = 0; j < values.length; j++) {
                values[j] = Math.random();
            }
        }
        
        this.to(target, 1);
    }

    private drawValue(data: RadarChartData|RadarChartData[]) {
        const datas = Array.isArray(data) ? data : [data];

        this.ctxValue.clear();

        for (let i = 0; i < datas.length; i++) {
            // 设置画笔
            this.ctxValue.strokeColor = datas[i].lineColor || defaultOptions.lineColor;
            this.ctxValue.fillColor = datas[i].fillColor || defaultOptions.fillColor;
            this.ctxValue.lineWidth = datas[i].lineWidth || defaultOptions.lineWidth;

            // 计算节点坐标
            let coords = [];
            for (let j = 0; j < this.axle; j++) {
                const value = Math.min(1, datas[i].values[j]);
                const length = value * this.axleLen;
                const radian = (Math.PI / 180) * this.angles[j];
                const pos = v2(length * Math.cos(radian), length * Math.sin(radian));
                coords.push(pos);
            }

            // 绘制数据连线
            this.ctxValue.moveTo(coords[0].x, coords[0].y);
            for (let i = 1; i < coords.length; i++) {
                const coord = coords[i];
                this.ctxValue.lineTo(coord.x, coord.y);
            }
            this.ctxValue.close();

            this.ctxValue.fill();

            this.ctxValue.stroke();

            // 绘制数据节点
            for (let j = 0; j < coords.length; j++) {
                const coord = coords[j];
                this.ctxValue.strokeColor = datas[i].lineColor || defaultOptions.lineColor;
                this.ctxValue.circle(coord.x, coord.y, 2);
                this.ctxValue.stroke();

                this.ctxValue.strokeColor = datas[i].joinColor || defaultOptions.joinColor;
                this.ctxValue.circle(coord.x, coord.y, 1);
                this.ctxValue.stroke();
            }
        }
    }

    private drawChart(axleNum: number, axleLen: number, axleLv: number) {
        this.ctxChart.lineWidth = 2;
        this.ctxChart.strokeColor = color(200, 200, 200, 125);
        this.ctxChart.fillColor = color(125, 125, 125, 125);

        this.angles = [];
        const iAngle = 360 / axleNum;
        // 计算数轴角度
        for (let i = 0; i < axleNum; i++) {
            const angle = iAngle * i;
            this.angles.push(angle);            
        }

        // 当前层刻度
        let scalesSet: Vec2[][] = [];
        for (let i = 0; i < axleLv; i++) {
            // 当前层刻度
            let scales = [];
            // 刻度在数轴上的位置
            const len = axleLen - (axleLen / axleLv * i);

            for (let j = 0; j < this.angles.length; j++) {
                const angle = this.angles[j];
                const radian = angle * (Math.PI / 180);
                const pos = v2(len * Math.cos(radian), len * Math.sin(radian));

                scales.push(pos);
            }
            scalesSet.push(scales);
        }

        // 轴线绘制
        for (let i = 0; i < axleNum; i++) {
            const element = scalesSet[0][i];
            this.ctxChart.moveTo(0, 0);
            this.ctxChart.lineTo(element.x, element.y);
        }

        // 刻度绘制
        for (let i = 0; i < scalesSet.length; i++) {
            const element = scalesSet[i];
            this.ctxChart.moveTo(element[0].x, element[0].y);
            for (let j = 1; j < element.length; j++) {
                const ele = element[j];
                this.ctxChart.lineTo(ele.x, ele.y);
            }
            // 闭合
            this.ctxChart.close();
        }


        // 填充颜色
        this.ctxChart.fill();
        // 绘制已经创建的线条
        this.ctxChart.stroke();
    }

    private to(data: RadarChartData|RadarChartData[], duration: number) {
        this.unscheduleAllCallbacks();

        const datas = Array.isArray(data) ? data : [data];

        this.keepUpdating = true;

        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            // 数值缓动
            for (let j = 0; j < data.values.length; j++) {
                const value = Math.min(1, data.values[j]);
                tween(this.curDatas[i].values)
                .to(duration, {[j]: value})
                .start();
            }
            // 样式缓动
            tween(this.curDatas[i])
            .to(duration, {
                lineWidth: data.lineWidth || this.curDatas[i].lineWidth,
                lineColor: data.lineColor || this.curDatas[i].lineColor,
                fillColor: data.fillColor || this.curDatas[i].fillColor,
                joinColor: data.joinColor || this.curDatas[i].joinColor,
            })
            .start();
        }

        this.scheduleOnce(() => {
            this.keepUpdating = false;
        }, duration);
    }

    protected update() {
        if (!this.keepUpdating) {
            return;
        }
        this.drawValue(this.curDatas);
    }
}

