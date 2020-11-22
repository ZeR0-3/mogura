import { BaseEntity } from "./BaseEnttity";
import { IobjE, BaseScene } from "../Scene/SceneBase";

import al = require("@akashic-extension/akashic-label");
export class Info  extends BaseEntity{

	protected sp: g.Label;
	protected _font: g.Font;
	protected _labal: al.Label | g.Label;

	protected _nowState: string;
	protected infotext: string = "";
	protected myentMakeOder: IobjE;

	constructor(protected _scene: BaseScene) {
		super(_scene);
		this._labal = this.makeEnt();
		this.init();
	}
	getscHand = (txt: string) => this.setInfoText(txt);
	public update() {

		this._labal.text = this.infotext;
		this._labal.invalidate();

	}

	public setInfoText = (text: string) => {
		this.infotext = text;
	}
	public gameInit = () => {
		this._labal.text = "";
	}

	public makeEnt() {
		// ベースのlabelとフォントのベースを作る
		// this._font = new g.DynamicFont({
		// 	game: g.game,
		// 	fontFamily: g.FontFamily.Serif,
		// 	size: 30
		// });
		// this._labal = new al.Label({
		// 	scene: this._scene.scene,
		// 	font: this._font,
		// 	text: "sample",
		// 	fontSize: 30,
		// 	textColor: "blue",
		// 	x: 300,
		// 	y: 5,
		// 	width: 100
		// });
		// return this._labal;
		// ベースのlabelとフォントのベースを作る
		this._labal =  this._scene.makelabel2();
		this._labal.text =  "";
		this._labal.fontSize = 36;
		this._labal.textColor = "yellow";
		this._labal.x = 300;
		this._labal.y = 3;
		this._labal.invalidate();
		return this._labal;

	}
	protected spInit(): void {
		//
	}
	protected takeSceneFromMess(tkobj: any): void {
		//
	}

}
