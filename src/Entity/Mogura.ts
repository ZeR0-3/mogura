import { BaseEntity } from "./BaseEnttity";
import { IobjE, BaseScene, ImkEntArg } from "../Scene/SceneBase";
import { Info } from "./info";
import { IforMogKanri, IisSurvivHandl, ISuv } from "../Kanri/Mograkanri";
import al = require("@akashic-extension/akashic-label");
import tl = require("@akashic-extension/akashic-timeline");
import { Yyy3 } from "../Scene/MGScene";
// import { Label } from "@akashic-extension/akashic-label";
export interface IisSurvivLisnor {
	// IisSurvivHandl
	suvAdd: (arg: IisSurvivHandl) => void;
}
export interface Imog {
	getMogState(): mogStateStr;
}
/** コリジョンエリア　四角 */
export interface IcollisionRectArea {
	x: number;
	y: number;
	width: number;
	hight: number;
}
const FlgHoleinout = { In: true, Out: false } as const;
type FlgHoleinout = typeof FlgHoleinout;

/** モグラ出現パラメータ */
export interface IMogSyutugenPrm {
	wait: number;
	OuttingTime: number;
	HoleOutKakuritu: number;
	id: number;
}
/** test */
export interface IhitSendPrm extends IMogSyutugenPrm {
	hlNum: number;
}
// enumの代わり
export const _mogState = {
	waiting: "steteWaiting",
	living: "stateLiveing",
	dead: "stateDead"} as const;
/**
 * "steteWaiting" | "stateLiveing" | "stateDead"
 */
type mogStateStr = typeof _mogState[keyof typeof _mogState];

export const _Now_or_Next = {
	Now:	"now",
	Next:	"next"
} as const;
type _Now_or_Next = typeof _Now_or_Next[keyof typeof _Now_or_Next];

export interface IMogstateFnc {
	stateWaiting(): void;
	stateLiveing(): void;
	stateDead(): void;
}
/**
 * @isArrow 有効かどうか　boolean 有効　true 無効　false
 * @boolean? 有効の時に意味がある
 */
export interface IisArrowBoolean {
	isArrow: boolean;
	boolean?: boolean;
}

export interface Fn { [arg: string]: () => void; }

export class Mogura extends BaseEntity implements IisSurvivLisnor, Imog {

	protected myentMakeOder: IobjE = { assetName: "ana", useCount: 1, assetSP: null };
	/** モグラ管理クラスインターファイス */
	protected imogkanri: IforMogKanri;
	// protected sp: g.E;
	protected _label: g.Label | al.Label;
	/** モグラのスプライト */
	protected mogSp: g.FrameSprite;
	protected mogSpArr: g.FrameSprite[] = [];

	protected anaSp: g.Sprite;
	protected paneSp: g.Pane;
	/** 今の状態(state)関数 */

	protected _stateStraegy: () => void;
	/** stateの文字列 */
	protected _nowStateStr: mogStateStr = _mogState.waiting;
	protected _nextStateStr: mogStateStr = null;
	// 穴が9個あってどこに待機
	protected _holeNum: number = 0;
	// 穴の座標
	protected _holePoint: Array<{ x: number, y: number }> = [
		{ x: 50, y: 25 }, { x: 300, y: 20 }, { x: 420, y: 40 },
		{ x: 80, y: 130 }, { x: 210, y: 155 }, { x: 500, y: 150 },
		{ x: 110, y: 230 }, { x: 310, y: 220 }, { x: 450, y: 240 }];
	// 穴に潜っている

	/**  穴	の中にいるか
	 * ture 穴In
	 * false 外Out
	 */
	protected isNowHoleIn: boolean = FlgHoleinout.In;

	/** タッチイベント来ていればあればtrue */
	protected isTachiE: boolean = false;

	/** 今穴から出ている途中かのフラグ */
	protected isHoleOutting: boolean = false;

	/** timeoutMachi */
	protected isTimeoutMachi: boolean = false;

	/** 穴から出ていいか許可フラグ */
	protected isHoleoutOk: boolean = false;
	/** ホールアウト中の時間 */
	// tslint:disable-next-line:typedef
	protected holeouttime = 100;

	/** holeIn,holeOut関数を入れる変数 */
	// protected nowHoleinOutFun: any;
	protected wtime: number = 30;
	/**
	 * 現在の状態を表す関数オブジェクト
	 * 待機		steteWaiting
	 * 生きてる	stateLiveing
	 * 死んでる	stateDead
	 */
	// tslint:disable-next-line:member-ordering
	protected state = {
		steteWaiting: () => this.stateWaiting(),
		stateLiveing: () => this.stateLiveing(),
		stateDead: () => this.stateDead()
	};

	/** タイムライン */
	protected timeline: tl.Timeline;
	protected anaTimeline: tl.Timeline;
	protected groundTimeline: tl.Timeline;
	// protected lblInfoText: al.Label;

	/** メインループ関数 */
	protected updateK: () => void;
	// protected inoutFnc: any;
	// public tt1: string = "con";

	/** ポイントダウンイベント */
	protected _myev: g.PointDownEvent = null;
	/** 得点用の関数 */
	protected _setSc: any = null;
	/** 自分には当たってないよを関数 */
	protected _setSCnoHit: any = null;
	/** コリジョンチェックするかしないか */
	protected _isColChkOk: boolean = false;
	/** 生き残れたかの拡張フラグ */
	protected _isSurvivor: IisArrowBoolean = {isArrow: false};
	/** デフォルトの出現パラメータ */
	protected _prm: IMogSyutugenPrm = {
		HoleOutKakuritu: 90, // 穴待機から外に出る確率
		OuttingTime: 3000, // 外に出ている時間
		wait: 400,
		id: 0 // モグラのタイプ
	};
	/** 当たり判定で
	 * 当たった時	true
	 * 外した時		false
	 * 得点を送った時に初期化する(false)
	 */
	protected _isHit: boolean = false;

	protected _hitSendPrm: IhitSendPrm = null;
	protected _isSurvivFnc: IisSurvivHandl = null;
	/**
	 * コンストラクタ
	 *
	 *
	 * @param _scene
	 */
	constructor(protected _scene: Yyy3, imogkanri: IforMogKanri) {
		super(_scene);
		this.imogkanri = imogkanri;
		this.suvAdd(imogkanri as IisSurvivHandl);
		this.init();
		// this.nowHoleinOutFun = this.holeIn;
		// this.lblInfoText = new Info(this._scene).makeEnt();
		// this.lblInfoText.text = "isHoleOutting:" + String(this.isHoleOutting);
		// this.BaseEsp.append(this.lblInfoText);
		this.updateK = this.stateWaiting();

	}
	getMogState(Now_or_Next?: _Now_or_Next ): mogStateStr {
		if (!Now_or_Next && Now_or_Next === _Now_or_Next.Now) {
			return this._nowStateStr;
		} else {
			return this._nextStateStr;
		}

	}
	suvAdd = (arg: IisSurvivHandl) => {
		this._isSurvivFnc = arg;
		// this._isSurvivFnc.survivorHandl(this.prm.id, true );
	}

	/** パラメータセット */
	set prm(prm: IMogSyutugenPrm) {
		// waitの時しかセットできないようにすべき？
		// this._label.text = (prm) ? "set" + prm.id : "undefind";
		// this._label.invalidate();
		this._prm = prm;
	}
	get prm() {
		return this._prm;
	}
	get isHit() {
		return this._isHit;
	}
	get isColChkOk() {
		return this._isColChkOk;
	}
	/**
	 * 
	 * 
	 * waiting 
	 */
	protected stateWaiting = () => {
		// なんか初期化する
		// this.paneSp.remove(this.mogSp);
		// this.mogSp = this.mogSpArr[this.prm.id];
		// this.paneSp.insertBefore(this.mogSp, this.anaSp);
		// this.paneSp.append(this.mogSp);
		this.mogSp.x = 0;
		this.mogSp.y = 0;
		this.mogSp.angle = 0;
		// this.updateK = this.stateWaiting;
		// 穴から出てよいなら
		// this.tt1 = "   wait1";
		// とりあえずここに戻ってきたら許可フラグはリセットしておく
		this.isTachiE = false;
		this.isHoleoutOk = false;
		// this.spInit();
		this.mogSp.frameNumber = 0;
		this.mogSp.hide();
		this.mogSp.modified();
		this._nextStateStr = _mogState.waiting;
		return () => {
			this._isColChkOk = false;
			// this.tt1 = "  wait2";
			const ok = (g.game.random.generate() * 100) > this.prm.HoleOutKakuritu;
			if (this.isHoleoutOk && ok) {
				// this.tt1 = "   wait3";
				// 穴の中に入る（入っている状態で生きてますループに移行)

				this._nextStateStr = _mogState.living;
				// this.isHoleoutOk = false;
			}
		};

	}
	protected getNxetFnc(_nextstateStr: mogStateStr) {
		return this.state[_nextstateStr];
	}
	/**
	 * 
	 *  liveing
	 */
	protected stateLiveing = () => {
		// this.tt1 = "    *********************live1";
		this._nextStateStr = _mogState.living;
		// let move2 = this.holeOut();
		let move2 = this.move1();
		this.isTachiE = false;
		this._isColChkOk = false;
		this.mogSpInit();
		return () => {

			move2();
			if (this.isTachiE && this._isColChkOk ) {
				const arg: ISuv = {
					holeNum : this._holeNum,
					tpid: this._prm.id,
					isSurviv: undefined

				};

				this._isHit = this.coli();
				if (this._isHit) {

					this.isTachiE = false;
					// if (this.coli()) {
					switch (this.prm.id) {
						case 0:
							this.sendTokuten(100000);
							break;
						case 1:
							this.sendTokuten(10);
							break;
						case 2:
							this.sendTokuten(20);
							break;
						case 3:
							this.sendTokuten(50);
							break;
					}
					arg.isSurviv = false;
					this._isSurvivFnc ? this._isSurvivFnc.survivorHandl(arg) : undefined;
					this._setSCnoHit ? this._setSCnoHit(true, this._holeNum) : null;
					// this.sendTokuten(10);
					this._nextStateStr = _mogState.dead;
					// return;
				} else {
					this._setSCnoHit ? this._setSCnoHit(false, this._holeNum) : null;
					this.isTachiE = false;
					// this.sendTokuten(-100);
					
				}

			} else {
				this.isTachiE = false;
			}
		};
	}
	/** 旧holeout()  改良版 */
	// tslint:disable-next-line:member-ordering
	move1 = () => {
		/** 出撃まで少し時間稼ぎ */
		const wait = () => {
			this._isColChkOk = false;
			this.mogSp.frameNumber = 0;
			this.mogSp.hide();
			this.mogSp.modified();
			const sc = this._scene.scene;
			this.anaTimeline = new tl.Timeline(sc);
			this.anaTimeline.create(this.anaSp, { loop: true })
				.rotateBy(8, 50).rotateBy(-8, 50);
			this._scene.scene.setTimeout(() => {
				this.anaTimeline.destroy();
				this.anaSp.angle = 0;
				lmove = timersetout;
			}, this.prm.wait);
			lmove = stey;

		};
		/** モグラ出現 */
		const timersetout = () => {
			const sc = this._scene.scene;
			this.timeline = new tl.Timeline(sc);
			const anaH = 30;
			const heigtht = this.mogSp.height;
			const outTime = Math.floor(this.prm.OuttingTime / 3) * 2;
			const inTime = this.prm.OuttingTime - outTime;
			const limtHight = (Math.floor(g.game.random.generate() * 100) > 15) ? 0 : Math.floor(heigtht / 2 - 10);
			this.mogSp.y = (heigtht - anaH);
			this.timeline.create(this.mogSp)
				.moveTo(0, limtHight, outTime, tl.Easing.easeInOutExpo)
				.moveTo(0, heigtht, inTime, tl.Easing.easeInExpo);

			this._isColChkOk = true;
			this.mogSp.frameNumber = 0;
			this.mogSp.show();
			this.mogSp.modified();

			this._scene.scene.setTimeout(this.prm.OuttingTime, () => {
				lmove = hin;
			});
			lmove = stey;
		};
		/** 何も変わらず同じ状態維持 */
		const stey = () => {
			// setTimeOutが行き先を変更するはず
		};
		/** 穴に潜らせていただきます */
		const hin = () => {
			const arg: ISuv = {
				holeNum : this._holeNum,
				tpid: this._prm.id,
				isSurviv: true

			};
			this._isSurvivFnc ? this._isSurvivFnc.survivorHandl(arg) : undefined;
			this._isColChkOk = false;
			this.mogSp.frameNumber = 0;
			this.mogSp.hide();
			this.mogSp.modified();
			this._nextStateStr = _mogState.waiting;
		};
		/** 初めに待機から */
		let lmove = wait;
		return () => {
			/** クロージャ使ってループ回す */
			lmove();

		};

	}

	/**　死んだときに呼ばれる
	 * deadフラグをセットして
	 * 必要ならアニメ処理？
	 * ヒットしている時にstateは生きてる状態なのかヒッティング状態なのか？
	 *
	 */
	protected stateDead = () => {
		let sw = 0;
		this._nextStateStr = _mogState.dead;
		const sc = this._scene.scene;
		this.timeline.cancelAll();
		this.timeline.create(this.mogSp, { loop: true }).rotateBy(8, 50).rotateBy(-8, 50);
		return () => {
			switch (sw) {
				case 0:
					this.hit();
					sw = 2;
					this._scene.scene.setTimeout(180, () => {
						this.timeline.cancelAll();
						sw = 1;
					});
					break;
				case 1:
					this._nextStateStr = _mogState.waiting;
					break;
				case 2:
					break;

			}
		};
	}
	

	protected hit() {
		(this._scene.scene.assets["hit"] as g.AudioAsset).play();
		this.mogSp.frameNumber = 1;
		this.mogSp.modified();

	}
	protected mogSpInit = () => {
		this.paneSp.remove(this.mogSp);
		this.mogSp = this.mogSpArr[this.prm.id];
		this.paneSp.insertBefore(this.mogSp, this.anaSp);
		this.mogSp.x = 0;
		this.mogSp.y = 0;
		this.mogSp.angle = 0;
		this.mogSp.frameNumber = 0;
		this.mogSp.hide();
		this.mogSp.modified();
	}

	protected makeEnt(): g.E {

		const scene = this._scene.scene;
		this.mogSpArr[0] = new g.FrameSprite({
			scene: scene,
			src: scene.assets["moguraall"] as g.ImageAsset,
			width: 112,
			height: 96,
			srcWidth: 112,
			srcHeight: 96,
			frames: [0, 1],
			frameNumber: 0
		});
		this.mogSpArr[1] = this.mogSpArr[0];
		this.mogSpArr[2] = new g.FrameSprite({
			scene: scene,
			src: scene.assets["moguraallb"] as g.ImageAsset,
			width: 112,
			height: 96,
			srcWidth: 112,
			srcHeight: 96,
			frames: [0, 1],
			frameNumber: 0
		});
		this.mogSpArr[3] = new g.FrameSprite({
			scene: scene,
			src: scene.assets["moguraallr"] as g.ImageAsset,
			width: 112,
			height: 96,
			srcWidth: 112,
			srcHeight: 96,
			frames: [0, 1],
			frameNumber: 0
		});
		this.mogSp = this.mogSpArr[0];
		this.paneSp = new g.Pane({ scene: scene, width: 112, height: 90 });
		this.paneSp.append(this.mogSp);


		this.anaSp = new g.Sprite({
			scene: scene,
			src: scene.assets["ana"] as g.ImageAsset,
			width: 112,
			height: 96
		});
		this.mogSp.hide();
		// this.sp.show();
		// this._label = this._scene.makeLabel(30);
		this.paneSp.append(this.anaSp);
		// this.paneSp.append(this._label);
		// this._label.text = "";
		// this._label.x = 0;
		// this._label.y = 0;
		// this._label.textColor = "whait";
		// this._label.visible();
		// this.paneSp.invalidate();
		return this.paneSp;
	}

	protected spInit() {
		const base = this.BaseEsp;
		// プレイヤーの初期座標を、画面の中心に設定します
		base.x = this._holePoint[this._holeNum].x;
		base.y = this._holePoint[this._holeNum].y;

	}
	protected spShow() {
		this.mogSp.show();
	}
	protected spHide() {
		this.mogSp.hide();
	}
	/** 当たり判定 */
	protected coli = () => {
		const ev: g.PointDownEvent = this._myev;
		return this.iscoli(ev);

	}
	///////////////////////////////////////////////////////////////////////////////////////
	//
	//
	//
	//
	///////////////////////////////////////////////////////////////////////////////////////
	// tslint:disable-next-line:member-ordering
	public update() {
		// this._label.text = (this.prm) ? "" + this.prm.id : "update undefind";
		// this._label.invalidate();
		//
		if (this._nextStateStr !== this._nowStateStr) {
			this._nowStateStr = this._nextStateStr;
			this.updateK = this.state[this._nowStateStr]();
		}
		this.updateK();
	}
	/** ゲームの初期化の時呼ばれる */
	// tslint:disable-next-line: member-ordering
	public gameInit() {
		// this.move1 = hide();
		this.mogSp.frameNumber = 1;
		this._nextStateStr = _mogState.waiting;
		this.isTachiE = false;

	}

	// tslint:disable-next-line:member-ordering
	public takeSceneFromMess(_oob: any) {
		this._nowStateStr = _oob.str;
	}

	// tslint:disable-next-line:member-ordering
	public tochiE = (ev: g.PointDownEvent) => {
		this._myev = ev;
		this.isTachiE = true;
	}

	// tslint:disable-next-line:member-ordering
	public setHolnumber(num: number): void {
		this._holeNum = num;
		this.spInit();
	}

	// tslint:disable-next-line:member-ordering
	public setOuttingKyoka(ok: boolean): void {
		this.isHoleoutOk = ok;
	}
	// tslint:disable-next-line:member-ordering
	public getisHoloutOk(): boolean {
		return this.isHoleoutOk;
	}

	// tslint:disable-next-line:member-ordering
	public iscoli = (ev: g.PointDownEvent) => {
		// const ev: g.PointDownEvent = this._myev;
		const wit = this.mogSp.width;
		const hit = this.anaSp.height;
		const bex = this.BaseEsp.x;
		const bey = this.BaseEsp.y;
		const anaHight = 20;

		if (bex < ev.point.x && (bex + wit) > ev.point.x &&
			(bey + this.mogSp.y) < ev.point.y && (bey + hit - anaHight) > ev.point.y) {
			this.isTachiE = false;
			// this.sendTokuten(10);
			return true;
		} else {
			this.isTachiE = false;
			return false;
		}

	}

	// tslint:disable-next-line: member-ordering
	public sendTokuten = (po: number) => {
		// if (!this._setSc){
		// 	this._setSc(po);
		// }
	}

	// tslint:disable-next-line:member-ordering
	// public setScFnc = (fnc: (fnc: () => void) => void ) => {
	/** 関数をもらってる
	 * 得点用に使用
	 * ヒットしてない時に使えるように拡張する
	 * ヒットしてないフラグとPRMを一緒に返す関数
	 * ID文字で判別してセットしてみよう
	 * sndSC得点用
	 * sndIsHitAndPrm 将来的に管理クラスに両方送ってからヒットしたときには
	 * スコアに送るようにしよう。もちろん点数を何点にするとかも考えるために
	 * コンボとか考えればモグラクラス単体では得点を計算するのはどうなのかなって
	 */
	public setScFnc = (fnc: any, idStr?: string) => {
		if (!idStr) {
			this._setSc = fnc;
		} else {
			this._setSCnoHit = fnc;
		}
	}

	/** コリジョンエリアcollision ゲーム画面上の座標
	 * レクト判定
	 * Yの上端はモグラが上下するのでそれに合わせる
	 * Yの下限は穴の上端くらいにする
	 */
	getColiAria = (): {leftX: number, wight: number, topY: number, hight: number} => {
		
		// Baseのx,y 左上座標（Sceneの座標）
		const baseY = this.paneSp.y;
		// 最下層部y
		const underY = baseY + this.paneSp.height;
		// 穴の高さ（仮）
		const anaH = 20;
		// モグラの現在y
		const _mogSpHight =　this.mogSp.y;
		

		return {	leftX: this.mogSp.x, wight: this.mogSp.x + this.mogSp.width,
					topY: baseY + this.mogSp.y, hight: underY};
	}
	

}
