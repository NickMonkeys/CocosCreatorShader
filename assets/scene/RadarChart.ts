import { _decorator, Component, Node, Graphics, Vec2, v2, Color, color } from 'cc';
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
    joinColor: color(255, 0, 0, 255),
};

@ccclass('RadarChart')
export class RadarChart extends Component {
    @property(Graphics)
    ctx: Graphics = null;

    private axeds = 3; // 数轴数量
    private angles = []; // 数轴角度

    private axisLength = 100;
    start() {
        const data: RadarChartData = {
            values: [0.7, 0.9, 0.5],
            lineWidth: 2,
        }
        this.drawAxeds(data.values.length, 100, 3);
       
        this.draw(data);

    }

    private draw(data: RadarChartData|RadarChartData[]) {
        const datas = Array.isArray(data) ? data : [data];

        for (let i = 0; i < datas.length; i++) {
            // 设置画笔
            this.ctx.strokeColor = datas[i].lineColor || defaultOptions.lineColor;
            this.ctx.fillColor = datas[i].fillColor || defaultOptions.fillColor;
            this.ctx.lineWidth = datas[i].lineWidth || defaultOptions.lineWidth;

            // 计算节点坐标
            let coords = [];
            for (let j = 0; j < this.axeds; j++) {
                const value = datas[i].values[j] > 1 ? 1 : datas[i].values[j];
                const length = value * this.axisLength;
                const radian = (Math.PI / 180) * this.angles[j];
                const pos = v2(length * Math.cos(radian), length * Math.sin(radian));
                coords.push(pos);
            }

            // 绘制数据连线
            this.ctx.moveTo(coords[0].x, coords[0].y);
            for (let i = 1; i < coords.length; i++) {
                const coord = coords[i];
                this.ctx.lineTo(coord.x, coord.y);
            }
            this.ctx.close();

            this.ctx.fill();

            this.ctx.stroke();

            // 绘制数据节点
            for (let j = 0; j < coords.length; j++) {
                const coord = coords[j];
                this.ctx.strokeColor = datas[i].lineColor || defaultOptions.lineColor;
                this.ctx.circle(coord.x, coord.y, 2);
                this.ctx.stroke();

                this.ctx.strokeColor = datas[i].lineColor || defaultOptions.lineColor;
                this.ctx.circle(coord.x, coord.y, .65);
                this.ctx.stroke();
            }
        }
    }

    private drawAxeds(axedxNum: number, axedxLen: number, axedxLv: number) {
        this.ctx.lineWidth = 2;

        this.axeds = axedxNum;

        this.angles = [];
        const iAngle = 360 / this.axeds;
        // 计算数轴角度
        for (let i = 0; i < this.axeds; i++) {
            const angle = iAngle * i;
            this.angles.push(angle);            
        }

        // 当前层刻度
        let scalesSet: Vec2[][] = [];
        for (let i = 0; i < axedxLv; i++) {
            // 当前层刻度
            let scales = [];
            // 刻度在数轴上的位置
            const len = axedxLen - (axedxLen / axedxLv * i);

            for (let j = 0; j < this.angles.length; j++) {
                const angle = this.angles[j];
                const radian = angle * (Math.PI / 180);
                const pos = v2(len * Math.cos(radian), len * Math.sin(radian));

                scales.push(pos);
            }
            scalesSet.push(scales);
        }

        // 轴线绘制
        for (let i = 0; i < this.axeds; i++) {
            const element = scalesSet[0][i];
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(element.x, element.y);
        }

        // 刻度绘制
        for (let i = 0; i < scalesSet.length; i++) {
            const element = scalesSet[i];
            this.ctx.moveTo(element[0].x, element[0].y);
            for (let j = 1; j < element.length; j++) {
                const ele = element[j];
                this.ctx.lineTo(ele.x, ele.y);
            }
            // 闭合
            this.ctx.close();
        }


        // 填充颜色
        this.ctx.fill();
        // 绘制已经创建的线条
        this.ctx.stroke();
    }
}

