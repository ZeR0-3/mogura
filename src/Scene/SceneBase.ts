import { GameMainParameterObject, RPGAtsumaruWindow } from "../parameterObject";
import al = require("@akashic-extension/akashic-label");
export interface IobjE {
	assetName: string;
	useCount: number;
	assetSP: g.E;
}

export interface ImkEntArg {
	name: string;
	spType: string;
}
export interface IPoint {
	x: number;
	y: number;
}

// tslint:disable-next-line:import-spacing
// import { Label }  from "@akashic-extension/akashic-label";
declare const window: RPGAtsumaruWindow;
export abstract class BaseScene {
	constructor(protected param: GameMainParameterObject){}
	public get scene() {
		return this._scene;
	}
	protected abstract assetIds: string[];
	protected _game: g.Game = g.game;
	protected _scene: g.Scene;
	protected _gameSnario: (fscene: g.Scene) => void;

	protected abstract _eObj: IobjE;

	public init() {

		this._gameSnario = this.fsla;
		this.makescene();
	}

	/**
	 * Akashic E 作る
	 * @name このシーンでのENTの名前
	 * { name:          , e.type ex) sprite などは　名前　　　　rect }
	 */
	// tslint:disable-next-line:member-ordering
	// public makeEnt( spobj: ImkEntArg): g.E {
	// 	const spName = spobj.name;

	// 	const spType = spobj.spType;

	// 	return this.makeEntSP(spName);
	// }

	public makeEntAssetsIdSp() {
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	//   g.E 即席工場
	//
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * 最低限のg.E(sprite, rectなど)を作る
	 * {e type, }
	 * @param spent
	 */
	public makeEntSP(spent: string): g.E {
		const scene = this._scene;
		const msprite = this.makeSprite(spent);

		return msprite;
	}
	public makeSprite(spName: string) {
		return new g.Sprite({
			scene: this._scene,
			src: this._scene.assets[spName],
			width: ((this._scene.assets[spName]) as g.ImageAsset).width,
			height: ((this.scene.assets[spName]) as g.ImageAsset).height
		});
	}
	public makeFremSprite() { };
	public makeRect() { };
	
	public makeLabel(mfontSize?: number) {

		const _font = new g.DynamicFont({
			game: g.game,
			fontFamily: g.FontFamily.Serif,
			size: mfontSize ? mfontSize : 15
		});
		
		// const _label = new al.Label({
		// 	scene: this.scene,
		// 	text: "Hello!",
		// 	font: _font,
		// 	fontSize: 56,
		// 	textColor: "blue",
		// 	width: 180,
		// 	x: 0,
		// 	y: 0
		// });

		const _labal = new al.Label({
			scene: this.scene,
			font: _font,
			text: String("tttttttttttttttttttttt"),
			fontSize: mfontSize,
			textColor: "blue",
			width: 180,
			x: 0,
			y: 0
		});
		return _labal;
	}
	public makelabel2 = () => {
		// 上で生成した font.png と font_glyphs.json に対応するアセットを取得
		const fontAsset = g.game.scene().assets["font"] as g.ImageAsset;
		const fontGlyphAsset = g.game.scene().assets["font_glyphs"] as g.TextAsset;

		// テキストアセット (JSON) の内容をオブジェクトに変換
		const glyphData = JSON.parse(fontGlyphAsset.data);

		// ビットマップフォントを生成
		const _font = new g.BitmapFont({
			src: fontAsset,
			map: glyphData.map,
			defaultGlyphWidth: glyphData.width,
			defaultGlyphHeight: glyphData.height,
			missingGlyph: glyphData.missingGlyph
		});
		const _labal = new g.Label({
			scene: this.scene,
			font: _font,
			text: String(""),
			fontSize: 64,
			textColor: "blue",
			width: 180,
			x: 0,
			y: 0
		});
		return _labal;
	}
	
	protected getSinario() {
		return this.fsla(this._scene);
	}

	protected abstract fsla(fscene: g.Scene): void;

	protected makescene() {
		this._scene = new g.Scene({
			game: this._game,
			assetIds: this.assetIds
		});
		this.sceneLoadAfter();
		return this._scene;

	}
	// シーンロード後に実行する
	protected sceneLoadAfter() {
		this._scene.loaded.add(() => this.fsla(this._scene));
	}

}
