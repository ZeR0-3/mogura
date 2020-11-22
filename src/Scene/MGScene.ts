import { GameMainParameterObject, RPGAtsumaruWindow } from "../parameterObject";
import { BaseScene, IobjE } from "./SceneBase";
import { Timer } from "../Entity/Timer";
import { Mogura } from "../Entity/Mogura";
import { Mogurakanri } from "../Kanri/Mograkanri";
import { Bg } from "../Entity/BG";
import { Score } from "../Entity/Score";
import { Title } from "../Entity/Title";
import { End } from "../Entity/End";
import { Timeline } from "@akashic-extension/akashic-timeline";
import { easeOutSine } from "@akashic-extension/akashic-timeline/lib/Easing";
import { Info } from "../Entity/info";
declare const window: RPGAtsumaruWindow;
interface IgameState {
	tit: () => void;
	gameloop: () => void;
	end: () => void;
}

export class Yyy3 extends BaseScene implements IgameState {

	protected _eObj: IobjE;
	protected assetIds: string[] = ["player", "shot", "se", "ana", "moguraall", "moguraallr", "moguraallb",
		"titile", "moguraSetumei", "hajime", "gameend", "font", "font_glyphs",
		"bg", "bg1", "hit", "miss", "bgm"];
	protected _gameState: any;
	/** 草むら用レイヤー */
	protected _bgly: g.E;
	/** モグラ用レイヤー */
	protected _chly: g.E;
	/** 一番大元のレイヤー */
	protected _mainly: g.E;

	/** 地面揺らすためのタイムライン */
	protected timeline: Timeline;
	// 現在のモグラ最大出現数
	protected nowMaxMog: number = 3;
	public tit = () => { };
	public gameloop = () => { };
	public end = () => { };
	public time: number;
	// tslint:disable-next-line:member-ordering
	constructor(param: GameMainParameterObject) {
		super(param);
		this.init();
		this._gameState = {
			tit: this.tit,
			gameloop: this.gameloop,
			end: this.end
		};

	}

	get bgly(): g.E {
		return this._bgly;
	}
	get chly(): g.E {
		return this._chly;
	}
	get mainly(): g.E {
		return this._mainly;
	}

	/**  本体 */
	protected fsla = (fscene: g.Scene) => {
		let time = 100; // 制限時間
		let _nowGameState: any;
		this._mainly = new g.E({ scene: this.scene });
		/** 地上の草むらレイヤー */
		this._bgly = new g.E({ scene: this.scene });
		/** モグラたちのいるレイヤー */
		this._chly = new g.E({ scene: this.scene });
		this._mainly.append(this._bgly);
		this._mainly.append(this._chly);
		this.scene.append(this.mainly);
		/** レイヤーをシーンに追加 */
		// this.scene.append(this._bgly);
		// this.scene.append(this._chly);
		const hSp = this.makeSprite("hajime");

		/** 草むら */
		const bbg = new Bg(this);
		/** ゲーム本体関数 */
		const scene = fscene;
		/** モグラ管理クラス */
		const mkanri = new Mogurakanri(this);
		/** タイマークラス */
		const mtimer = new Timer(this);
		/** info */
		const _info = new Info(this);
		/** スコア */
		const score = new Score(this);

		/** 草むらをレイヤーに追加 */
		bbg.addSP2Scene(this._bgly);
		/** タイマーを追加 */
		mtimer.addSP2Scene(this._bgly);
		mtimer.setXY({ x: 570, y: 3 });

		score.addSP2Scene(this._bgly);
		score.setXY({ x: 5, y: 3 });

		_info.addSP2Scene(this._bgly);
		mkanri._scFncTest = score.getscHand;
		mkanri._scFncTest2 = _info.getscHand;

		// for (let i = 0; i < 9; i++) {
		// 	mkanri.getMogSp()[i].setScFnc(score.getscHand);
		// }
		mkanri.setScFnc(score.getscHand);
		scene.pointDownCapture.add((ev) => { mkanri.tc(ev); });
		const titleE = new Title(this);
		scene.append(titleE.BaseEsp);
		const endE = new End(this);
		const gameInit = () => {
			score.gameInit();

		};
		/** タイトルState */
		this._gameState.tit = () => {
			const pd = () => {
				scene.remove(titleE.BaseEsp);
				
				_nowGameState = this._gameState.gameloop();
				scene.pointDownCapture.remove(pd);
			};
			bbg.gameInit();
			_info.gameInit();
			titleE.start();
			// this.timeline = new Timeline(this.scene);
			// titleE.BaseEsp.scale(0);
			// const x = titleE.BaseEsp.width;
			// const y = titleE.BaseEsp.height;
			// titleE.BaseEsp.moveTo(320, 120);
			// titleE.BaseEsp.anchor( 0.5, 0.5);
			// titleE.BaseEsp.modified();
			// this.timeline.create(titleE.BaseEsp).scaleTo(1, 1, 500, easeOutSine)
			// 									.con()
			// 									.moveTo( 0, 0, 500, easeOutSine);
			// this.scene.setTimeout( () => {
			// 	scene.pointDownCapture.add(pd);
			// },                     50);
			this.scene.setTimeout(() => {
				scene.remove(titleE.BaseEsp);
				this.scene.append(hSp);
				this.scene.setTimeout(() => {
					_nowGameState = this._gameState.gameloop();
					this.scene.remove(hSp);
				}, 300);
				
			}, 6000);
			return (): void => {
				//
			};
		};
		/** ゲームループState */
		this._gameState.gameloop = () => {
			mtimer.gameInit();
			score.gameInit();
			bbg.gameInit();
			mtimer.start();
			mkanri.gameInit();
			mkanri.start();
			// (this.scene.assets["bgm"] as g.AudioAsset).play();
			const bgmT = (this.scene.assets["bgm"] as g.AudioAsset).play();
			bgmT.changeVolume(0.3);

			scene.setTimeout(() => {
				bbg.cngBg();
			}, 80000);
			return (): void => {
				if (mtimer.timeclearid == null) {
					mtimer.start();
				}
				_info.update();
				mkanri.update();
				score.update();
				if (mtimer.timeUp) {
					scene.append(endE.BaseEsp);
					_nowGameState = this._gameState.end();

				}

			};
		};
		/** ゲーム終了State */
		this._gameState.end = () => {
			// const pd = () => {
			// 	scene.remove(endE.BaseEsp);
			// 	// mtimer.reset();
			// 	scene.append(titleE.BaseEsp);
			// 	_nowGameState = this._gameState.tit();
			// 	scene.pointDownCapture.remove(pd);

			// };
			this.scene.setTimeout( () => {
				// scene.pointDownCapture.add(pd);
				if (this.param.isAtsumaru) {
					const boardId = 1;
					window.RPGAtsumaru.experimental.scoreboards.setRecord(boardId, g.game.vars.gameState.score).then(function () {
						window.RPGAtsumaru.experimental.scoreboards.display(boardId);
					});
				}

			},                     800);
			return (): void => {
				// if (time <= 0) {
					// RPGアツマール環境であればランキングを表示します
									// scene.update.remove(updateHandler); // カウントダウンを止めるためにこのイベントハンドラを削除します
				// }
	
				//
			};
		};

		/** 実質のメインループ */
		_nowGameState = this._gameState.tit();
		this.scene.update.add(() => {
			_nowGameState();


		});

	}
	// 	const updateHandler = () => {
	// 		if (time <= 0) {
	// 			// RPGアツマール環境であればランキングを表示します
	// 			if (param.isAtsumaru) {
	// 				const boardId = 1;
	// 				window.RPGAtsumaru.experimental.scoreboards.setRecord(boardId, g.game.vars.gameState.score).then(function() {
	// 					window.RPGAtsumaru.experimental.scoreboards.display(boardId);
	// 				});
	// 			}
	// 			scene.update.remove(updateHandler); // カウントダウンを止めるためにこのイベントハンドラを削除します
	// 		}
	// 		// カウントダウン処理
	// 		time -= 1 / g.game.fps;
	// 		timeLabel.text = "TIME: " + Math.ceil(time);
	// 		timeLabel.invalidate();
	// 	};
	// 	scene.update.add(updateHandler);



}
