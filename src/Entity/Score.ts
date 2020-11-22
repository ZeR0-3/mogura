import { BaseEntity } from "./BaseEnttity";
import { IobjE, BaseScene } from "../Scene/SceneBase";
import al = require("@akashic-extension/akashic-label");
export class Score extends BaseEntity {
	protected myentMakeOder: IobjE;
	protected _font: g.Font;
	protected _labal: al.Label | g.Label ;
	protected _labal2: al.Label | g.Label ;
	protected _score: number = 0;
	protected _scoreTxt: string;
	protected _scHand: any;
	constructor(protected _scene: BaseScene) {
		super(_scene);
		this.init();
		this._score = 0;
		this._scoreTxt = String(this._score);
		this._scHand = this.setTokuten;

	}
	getscHand = (po: number) => this.setTokuten(po);
	public update(): void {
		this._labal.text =  "SCORE: " + this._score;
		this._labal.invalidate();
		this._labal2.text =  "SCORE: " + this._score;
		this._labal2.invalidate();
	}
	protected spInit(): void {
		;
	}
	protected makeEnt(): g.E {
				// ベースのlabelとフォントのベースを作る
				this._labal =  this._scene.makelabel2();
				this._labal.text =  "SCORE: " + this._score;
				this._labal.fontSize = 36;
				this._labal.textColor = "white";
				this._labal.x = -2;
				this._labal.y = -2;

				this._labal2 =  this._scene.makelabel2();
				this._labal2.text =  "SCORE: " + this._score;
				this._labal2.fontSize = 36;
				this._labal2.textColor = "darkslategray";
				// this._labal2.opacity = 0.7;
				this._labal2.append(this._labal);
				this._labal2.invalidate();
				this._labal.invalidate();
				return this._labal2;

	}
	protected takeSceneFromMess(tkobj: any): void {
		;
	}
	public setXY(pooint: { x: number, y: number }) {
		this._labal2.x = pooint.x;
		this._labal2.y = pooint.y;
	}
	// tslint:disable-next-line:align
	public setTokuten = (point: number) => {
		this._score += point;
		this._score = Math.max(this._score, 0); 
		g.game.vars.gameState.score = this._score;
	}

	public gameInit() {
		this._score = 0;
		g.game.vars.gameState.score = this._score;
		this.update();
	}
	
} 