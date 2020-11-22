import { Mogura, _mogState, IMogSyutugenPrm, IisSurvivLisnor, IhitSendPrm } from "../Entity/Mogura";
import { Yyy3 } from "../Scene/MGScene";
import al = require("@akashic-extension/akashic-label");
import { Info } from "../Entity/info";


export interface ISuv {
	holeNum: number;
	tpid: number;
	isSurviv: boolean;

}
export interface IisSurvivHandl {
	survivorHandl(arg: ISuv): void;
}
type _myState = typeof _mogState[keyof typeof _mogState];
export interface IforMogKanri extends IisSurvivHandl {
	// getMogholeIn(mogInNum: number): void;
	// getMogState(): _myState;
	setEvtHit(mogHitNum: number): void;

}
export interface ItimeSchedulePrm {
	setTime: number;
	fncLevel: () => void;
}
export interface ImogLvRate {
	type: number;
	ratePar: number;
}
export interface ImogLevelPrm {
	maxAct: number;
	arrImogLvRate: ImogLvRate[];
}
export class Mogurakanri implements IforMogKanri, IisSurvivHandl {
	/** Level0 */
	protected stLevel_adv: ImogLevelPrm[] = [{
		// ノーマルいちばん弱い
		// lv0
		maxAct: 1,
		arrImogLvRate: [{
			type: 0,
			ratePar: 100
		}]
	},
	{
		//
		// lv1
		maxAct: 2,
		arrImogLvRate: [{
			type: 0,
			ratePar: 100
		}]
	},
	{
		//
		// lv2
		maxAct: 4,
		arrImogLvRate: [{
			type: 0,
			ratePar: 95
		},
		{
			type: 1,
			ratePar: 5
		}]

	},
	{
		//
		// lv3
		maxAct: 2,
		arrImogLvRate: [{
			type: 0,
			ratePar: 30
		},
		{
			type: 1,
			ratePar: 70
		}]

	},
		{
		//
		// lv4
		maxAct: 3,
		arrImogLvRate: [{
			type: 0,
			ratePar: 45
		},
		{
			type: 1,
			ratePar: 40
		},
		{
			type: 2,
			ratePar: 15
		}
		]},
		{
			//
			// lv5
			maxAct: 3,
			arrImogLvRate: [{
				type: 0,
				ratePar: 10
			},
			{
				type: 1,
				ratePar: 35
			},
			{
				type: 2,
				ratePar: 55
			}]
	}];

	protected _mogLevel: IMogSyutugenPrm[] = [
		{
			HoleOutKakuritu: 60,
			OuttingTime: 3300, // 2500,
			wait: 150,
			id: 1
		},
		{
			HoleOutKakuritu: 80,
			OuttingTime: 2100,
			wait: 60,
			id: 2

		},
		{
			HoleOutKakuritu: 90,
			OuttingTime: 1100, // 1100,
			wait: 10,
			id: 3

		}
	];
	/** デバグラベル */
	protected _label: al.Label | g.Label;
	/** 最大モグラ出現可能数 */
	protected _maxMoguraActer: number = 9;
	/** 現在穴から出ることが許されている数 */
	protected _maxMoguraOutting: number;
	/** モグラクラス配列 */
	protected _mogClssArr: Mogura[] = [];
	/** 穴の中への許可待ちモグラインスタンス配列 */
	protected _mogOutStanbyState: Mogura[] = [];
	/** 現在穴から出る不許可モグラインスタンス配列　すでに出ているなど */
	protected _mogOutNoState: Mogura[] = [];
	/** タッチイベントを受け付けてるモグラインスタンス配列 */
	protected _mogIsTochOkArr: Mogura[] = [];
	protected orgScene: g.Scene;
	// protected _stlevel: (() => void);
	// protected _stlevelArr: Array<() => void> = [];

	protected timeScheduleList: ItimeSchedulePrm[] = [];
	/** タッチイベント来てる時true */
	protected _isTchEv: boolean = false;
	/** タッチイベント */
	protected _tcEv: g.PointDownEvent = null;
	protected _comb: number = 0;
	/** 仮 */
	// tslint:disable-next-line:member-ordering
	protected _tekitoArr: boolean[] = [];
	protected _allNohit: boolean = false;
	protected _fncTset: (fn: any) => void;
	public _scFncTest: (point: number) => void = null;
	protected _fncTset2: (fn: any) => void;
	public _scFncTest2: (text: string) => void = null;
	protected _suvTokei: { total: number; miss: number } = { total: 0, miss: 0 };
	protected _nowTimeLv: number = 0;
	protected tmScheduleList: {setTime: number, fncLevel: number}[] = [];
	protected sc: number = 0;
	protected info: Info;
	protected _lbInfo: g.E;
	protected _labalInfo: al.Label | g.Label;
	protected _labalInfo2: al.Label | g.Label;
	protected setSc: (po: number) => void;
	protected totalSuvArr: ISuv[] = [];
	/** コンストラクタ */
	constructor(protected _scene: Yyy3) {
		this.orgScene = _scene.scene;
		this._maxMoguraActer = 9;
		this._maxMoguraOutting = 1;
		this.init();

	}
	/** 生き残ったか結果を通知してくれる */
	// survivorHandl(id: number, isSurviv: boolean): void {
	survivorHandl(arg: ISuv): void {
		this.totalSuvArr.push(arg);
		const isSurviv = arg.isSurviv;
		const id = arg.tpid;
		this._suvTokei.total += 1;
		if (isSurviv) {
			this._comb = 0;
			this._suvTokei.miss += 1;
			// this.sc = this.sc - 10;
		} else {
			this.sc += ( (this._comb > 0) ? [0, 10, 20, 50][id] * 2 : [0, 10, 20, 50][id]);
			this.sendTokuten(( (this._comb > 0) ? [0, 10, 20, 50][id] * 2 : [0, 10, 20, 50][id]));
			this._comb += 1;
			const s = Math.floor(this._comb / 5);
			const bns = Math.pow(s, 2) * 50;
			this.sc += bns;
			this.sendTokuten(bns);
		}
	}

	public setScFnc(fn: (po: number) => void) {
		this.setSc = fn;
	}

	public sendTokuten = (po: number) => {
		this.setSc(po);
	}
	/** ヒットしたかはずしたかの配列をセット */
	isMogHitArrFnc = (isHit: boolean, hnum: number): void => {
		this._tekitoArr[hnum] = isHit;
	}
	set nowTimeLv(arg_nowTimeLv: number) {
		this._nowTimeLv = arg_nowTimeLv;
		this._maxMoguraOutting = this.stLevel_adv[this._nowTimeLv].maxAct;

	}
	get nowTimeLv() {
		return this._nowTimeLv;
	}

	/** 初期化 */
	protected init() {
		this.info = new Info(this._scene);
		this.info.addSP2Scene(this._scene.bgly);
		/** 初めにすべての穴にモグラをセット
		 *
		 */
		for (let i = 0; i < this._maxMoguraActer; i++) {
			this._mogClssArr[i] = new Mogura(this._scene, this);
			// this._mogClssArr[i].suvAdd(this);
			this._mogClssArr[i].setHolnumber(i);
			this._mogClssArr[i].prm = this._mogLevel[0];
			this._mogClssArr[i].addSP2Scene(this._scene.chly);
			this._mogClssArr[i].setScFnc(this.isMogHitArrFnc, "ishit");
		}
		this._mogOutStanbyState = [...this._mogClssArr];
		this._mogOutNoState = [];
		// デバグ用のラベル
		this._label = this.makeEnt();
		// this._scene.scene.append(this._label);
		this._scene.scene.append(this._lbInfo);
		this.gameInit();
	}

	/** ゲーム初期化 */
	// tslint:disable-next-line:member-ordering
	public gameInit() {
		this.totalSuvArr = [];
		this.nowTimeLv = 0;
		// this._maxMoguraOutting = this._maxMoguraOutting = this.stLevel_adv[this.nowTimeLv].maxAct;
		this.sc = 0;
		this._mogOutStanbyState = [...this._mogClssArr];
		this._mogOutNoState = [];
		this.getOkMogura2();
		this.setHoleOutKyoka2();

		for (let i = 0; i < this._maxMoguraActer; i++) {
			this._mogClssArr[i].gameInit();
		}
		this.info.gameInit();
		this._suvTokei.miss = 0;
		this._suvTokei.total = 0;
	}
	// tslint:disable-next-line:member-ordering
	public start = () => {
		this.tmScheduleList = [
				{setTime:	 5000, fncLevel: 1},
				{setTime:	 8000, fncLevel: 2},
				{setTime:	10000, fncLevel: 4},
				{setTime:	20000, fncLevel: 3},
				{setTime:	35000, fncLevel: 2},
				{setTime:	40000, fncLevel: 4},
				{setTime:	50000, fncLevel: 3},
				{setTime:	65000, fncLevel: 4},
				{setTime:	78000, fncLevel: 5}


		];
		for (let i = 0; i < this.tmScheduleList.length; i++ ) {
			this._scene.scene.setTimeout(() => {
			this.nowTimeLv = this.tmScheduleList[i].fncLevel;
			this._maxMoguraOutting = this.stLevel_adv[this.nowTimeLv].maxAct;

		},                            this.tmScheduleList[i].setTime);
		}
		this._isTchEv = false;

	}

	public getMogSp() {
		return this._mogClssArr;
	}

	/** メインループ
	 * 
	 * 
	 * 
	 * 
	 * 
	 * 
	 */
	// tslint:disable-next-line:member-ordering
	public update() {
		// this._label.text = String(this._comb);
		// this._label.invalidate();
		this.getOkMogura2();
		this.setHoleOutKyoka2();
		// this._stlevel();

		for (let i = 0; i < this._maxMoguraActer; i++) {

			this._mogClssArr[i].update();
		}
		if (this._comb === 0) this._scFncTest2("");
		let tmpStr: string;
		let tmpArr;
		let tmpCont = Object.keys(this._tekitoArr).length;
		if (tmpCont !== 0) {
			tmpArr = this._tekitoArr.filter((v) => {
				return (v === true);
			});
			if (Object.keys(tmpArr).length === 0) {
				tmpStr = "       NoHit!!!";
				this._scFncTest(-10);
				this._scFncTest2("Miss!!");
				this._comb = 0;
				this.sc = this.sc - 10;
				// this.sendTokuten(-10);
				(this._scene.scene.assets["miss"] as g.AudioAsset).play();
			} else {
				this._scFncTest2("");
			}
		} else if (this._isTchEv) {
			this._scFncTest(-10);
			this._scFncTest2("Miss!!");
			this._comb = 0;
			this.sc = this.sc - 10;
			this.sendTokuten(-10);
			(this._scene.scene.assets["miss"] as g.AudioAsset).play();
		}
		if (this._comb > 4) {
			this._scFncTest2("COMBO " + this._comb);
		}
		// this._label.text = "scre: " + this.sc;
		// this._label.invalidate();
		this._tekitoArr = [];
		this._isTchEv = false;
		this.info.setInfoText("" + this.sc);
		this.info.update();
		this._labalInfo.text = "" + (this._suvTokei.total - this._suvTokei.miss) + "/" + this._suvTokei.total;
		this._labalInfo2.text = this._suvTokei.total ? "" + Math.round((this._suvTokei.total - this._suvTokei.miss) / this._suvTokei.total * 1000) / 10 + "%" : "";
		this._labalInfo.invalidate();
		this._labalInfo2.invalidate();
	}
	protected strartTset = () => {
		//
	}
	protected getMOgState = (getSt: _myState) => {
		let tmpSt: _myState = null;
		for (let i = 0; i < this._mogClssArr.length; i++) {
			if (this._mogClssArr[i].getMogState() === _mogState.living) { };
		}
	}
	/** モグラタッチ可能配列を_mogIsTochOkArrに入れる */
	protected getMogIsTochOkArr = () => {
		// とりあえず空にする
		this._mogIsTochOkArr = [];
		for (let i = 0; this._mogClssArr.length; i++) {
			if (this._mogClssArr[i].isColChkOk) {
				this._mogIsTochOkArr.push(this._mogClssArr[i]);
			}
		}
	}
	protected setHoleOutKyoka2() {
		// waitリストがあっていると仮定して処理する
		let i = this._mogOutStanbyState.length - (this._maxMoguraActer - this._maxMoguraOutting);
		const tmpArr = this.sortMogArr([...this._mogOutStanbyState]);
		const tmM: Mogura[] = [];
		while (i > 0) {
			i--;
			tmM.push(tmpArr.pop());
			tmM[0].setOuttingKyoka(true);
			tmM[0].prm = this.createNowMogLevel(this.nowTimeLv);
			this._mogOutNoState.push(tmM.pop());
		}
		this._mogOutStanbyState = tmpArr;
	}
	/** モグラ配列から許可フラグ別に分けた２次元配列を返す *
	 * [０]　許可
	 * [１] NG
	 */
	protected getOkMogura2 = () => {
		const damy = [...this._mogClssArr];
		const tmpmog: Mogura[][] = [];
		tmpmog[0] = [];
		tmpmog[1] = [];
		for (let i = 0; i < this._mogClssArr.length; i++) {
			if (this._mogClssArr[i].getisHoloutOk()) {
				tmpmog[0].push(damy[i]);
			} else {
				tmpmog[1].push(damy[i]);
			}
		}
		this._mogOutNoState = tmpmog[0];
		this._mogOutStanbyState = tmpmog[1];
	}
	/** 与えられたMogura配列をシャッフルして返す */
	protected sortMogArr(_mogArr: Mogura[]) {
		const tmparr = _mogArr.filter(V => V);
		let m = _mogArr.length;
		while (m) {
			const i = Math.floor(g.game.random.generate() * m--);
			[_mogArr[m], _mogArr[i]] = [_mogArr[i], _mogArr[m]];
		}
		return _mogArr;

	}

	// tslint:disable-next-line:member-ordering
	public setEvtHit(mogHitNum: number) {
		let ss = "live" + String(this._mogOutNoState.length) + ":  ";
		const mog: Mogura = this._mogOutNoState.pop() as Mogura;
		ss = ss + String(this._mogOutNoState.length);
		this.show(ss);
		mog.setOuttingKyoka(false);
		this._mogOutStanbyState.push(mog);
	}
	/** タッチイベント */
	public tc = (ev: g.PointDownEvent) => {
		this._tcEv = ev;
		this._isTchEv = true;
		for (let i = 0; i < this._mogClssArr.length; i++) {
			this._mogClssArr[i].tochiE(ev);
		}
	}

	protected show(s: string) {

		// this._label.text = s;
		// this._label.invalidate();
	}
	protected makeEnt() {
		// ベースのlabelとフォントのベースを作る
		this._label = this._scene.makelabel2();
		// this._label.textColor = "green";
		// this._label.show();

		this._labalInfo =  this._scene.makelabel2();
		this._labalInfo.text =  "";
		this._labalInfo.fontSize = 24;
		this._labalInfo.textColor = "white";
		this._labalInfo.x = 0;
		this._labalInfo.y = 0;
		this._labalInfo.invalidate();
		this._labalInfo2 =  this._scene.makelabel2();
		this._labalInfo2.text =  "";
		this._labalInfo2.fontSize = 24;
		this._labalInfo2.textColor = "white";
		this._labalInfo2.x = 0;
		this._labalInfo2.y = 20;
		this._labalInfo2.invalidate();
		this._lbInfo = new g.E(this._scene);
		this._lbInfo.x = 0;
		this._lbInfo.y = 300;
		this._lbInfo.append(this._labalInfo);
		this._lbInfo.append(this._labalInfo2);
		return this._label;
	}
	/** モグラレベル工場
	 * 
	 * 
	 * 
	 * 
	 */
	protected createNowMogLevel = (nowLv?: number): IMogSyutugenPrm => {
		let _mogLvRate: ImogLvRate[] = this.stLevel_adv[this.nowTimeLv].arrImogLvRate;

		const _maxAct = this.stLevel_adv[this.nowTimeLv].maxAct;
		// 最大数4　5%　20％　75％
		this._maxMoguraOutting = _maxAct;
		// this._label.text = "creat:  mogOutNoState  " + this._mogOutNoState.length;
		// this._label.invalidate();

		// for (let i = 0; i < this._mogOutNoState.length; i++) {
			// this._label.text = "creat:           for I=" + i;
			// this._label.invalidate();
	
			const rd = Math.floor(g.game.random.generate() * 100); // 0~99
			let lv: number = _mogLvRate[0].type;
			let addParsent = 0;
			// for (let j = 0; j < _mogLvRate.length; j++) {
			let j = 0;
			while (true) {
				addParsent += _mogLvRate[j].ratePar;
				if (rd < addParsent) {
					lv = _mogLvRate[j].type;
					// this._mogOutNoState[i].prm = this._mogLevel[lv];
					// this._label.text = "creat:" + lv + this._mogLevel[lv];
					// this._label.invalidate();
					return this._mogLevel[lv];
					break;
				}
				j++;
			}
		// }

	}

}
