import { BaseEntity } from "./BaseEnttity";
import { IobjE, BaseScene } from "../Scene/SceneBase";
import al = require("@akashic-extension/akashic-label");
interface Itimeup2 {
	timeup2Fnc(): void;
}
export class Timer extends BaseEntity {

	protected myentMakeOder: IobjE;
	protected sp: g.Label;
	private _state: { [isArrive: string]: boolean; };
	private _font: g.Font;
	private _labal: g.Label;
	private _stateStraegy: () => void;
	private _istimeUp: boolean = false;
	// tslint:disable-next-line:typedef
	private timeClearid: g.TimerIdentifier;
	private _nowState: string;
	private _tcont: number = 90;
	protected finish: Itimeup2;
	protected timeoutFnc: (() => void)[] = [];
	constructor(protected _scene: BaseScene) {
		super(_scene);
		this.init();
	}
	get timeUp() {
		return this._istimeUp;
	}
	get timeclearid() {
		return this.timeClearid;
	}
	set tcont(tc: number) {
		this._tcont = 90;
	}
	public gameInit() {

		this._istimeUp = false;
		// if (this.timeClearid !== undefined) {
		// this._scene.scene.clearInterval(this.timeClearid);
		// }

		this._tcont = 90;
		this._labal.text = String(this._tcont);
		this._labal.textColor = "blue";
		this._labal.invalidate();
	}
	public update() {
		this._tcont--;
		if (this._tcont < 0) {
			this._tcont = 0;
			this._istimeUp = true;
			if (this.timeClearid != null) {
				this._scene.scene.clearInterval(this.timeClearid);
			}
		} else {
			this._labal.text = String(this._tcont);
			this._labal.invalidate();
		}

	}

	public spInit() { return; }

	makeEnt() {
		// ベースのlabelとフォントのベースを作る
		this._labal = this._scene.makelabel2();
		this._labal.text = String(this._tcont);
		this._labal.invalidate();
		return this._labal;
	}
	public start = () => {
		this._tcont = 90;
		this._labal.invalidate();
		// this.timeclearid = this.setTimerInterval();
		this.timeClearid = this._scene.scene.setInterval(1000, () => {
			this.update();
		});
		this._scene.scene.setTimeout(() => { this.colorCh("Yellow"); }, 60000);
		// this._scene.scene.setTimeout(() => { this.timeoutFnc[0]();}, 15000);
		this._scene.scene.setTimeout(() => { this.colorCh("Red"); }, 80000);
	}
	public timerInit = () => {
		
	}
	public timeoutadd(fnc: () => void, outtime: number) {
		this.timeoutFnc[outtime] = fnc;
	}
	public timeup2add = (fn: Itimeup2) => {
		this.finish = fn;
	}
	/**
	 * Timer リセット
	 */
	// public reset(min: number = 30): void {
	// 	this._scene.scene.clearInterval(this.timeClearid);
	// 	this._tcont = min;
	// 	this._labal.text = String(this._tcont);
	// 	this._labal.invalidate();
	// }

	public setXY(pooint: { x: number, y: number }) {
		this._labal.x = pooint.x;
		this._labal.y = pooint.y;
	}

	public takeSceneFromMess() { };

	public colorCh(color: string) {
		this._labal.textColor = color;
	}

	protected setTimerInterval(): g.TimerIdentifier {
		const r = this._scene.scene.setInterval(1000, () => {
			this.update();
		});
		this._scene.scene.setTimeout(() => { this.colorCh("Yellow"); }, 60000);
		this._scene.scene.setTimeout(() => { this.colorCh("Red"); }, 80000);
		return r;

	}

}
