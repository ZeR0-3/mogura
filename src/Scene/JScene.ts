import { GameMainParameterObject, RPGAtsumaruWindow } from "../parameterObject";
import { BaseScene, IobjE } from "./SceneBase";
declare const window: RPGAtsumaruWindow;
export class JScene extends BaseScene {
	public time: number;
	// public param: GameMainParameterObject;
	// protected assetIds: string[];
	protected _eObj: IobjE;
	protected assetIds: string[] = ["player", "shot", "se", "ana" , "moguraall", "moguraallr", "moguraallb",
	"titile", "gameend", "font", "font_glyphs",
	"bg", "bg1", "hit", "miss", "bgm"];
	constructor(param: GameMainParameterObject){
		super(param);
		this.init();
	}
	protected fsla(scene: g.Scene): void {
		// ここからゲーム内容を記述します

		// プレイヤーを生成します
		// const player = new g.Sprite({
		// 	scene: scene,
		// 	src: scene.assets["player"],
		// 	width: (scene.assets["player"] as g.ImageAsset).width,
		// 	height: (scene.assets["player"] as g.ImageAsset).height
		// });
		const player = this.makeSprite("player");

		// プレイヤーの初期座標を、画面の中心に設定します
		player.x = (g.game.width - player.width) / 2;
		player.y = (g.game.height - player.height) / 2;
		player.update.add(() => {
			// 毎フレームでY座標を再計算し、プレイヤーの飛んでいる動きを表現します
			// ここではMath.sinを利用して、時間経過によって増加するg.game.ageと組み合わせて
			player.y = (g.game.height - player.height) / 2 + Math.sin(g.game.age % (g.game.fps * 10) / 4) * 10;

			// プレイヤーの座標に変更があった場合、 modified() を実行して変更をゲームに通知します
			player.modified();
		});
		scene.append(player);

		// フォントの生成
		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: g.FontFamily.Serif,
			size: 48
		});

		// スコア表示用のラベル
		const scoreLabel = new g.Label({
			scene: scene,
			text: "SCORE: 0",
			font: font,
			fontSize: font.size / 2,
			textColor: "black"
		});
		scene.append(scoreLabel);

		// 残り時間表示用ラベル
		const timeLabel = new g.Label({
			scene: scene,
			text: "TIME: 0",
			font: font,
			fontSize: font.size / 2,
			textColor: "black",
			x: 0.7 * g.game.width
		});
		scene.append(timeLabel);

		// 画面をタッチしたとき、SEを鳴らします
		scene.pointDownCapture.add(() => {
			// 制限時間以内であればタッチ1回ごとにSCOREに+1します
			if (this.time > 0) {
				g.game.vars.gameState.score++;
				scoreLabel.text = "SCORE: " + g.game.vars.gameState.score;
				scoreLabel.invalidate();
			}
			(scene.assets["se"] as g.AudioAsset).play();

			// プレイヤーが発射する弾を生成します
			const shot = new g.Sprite({
				scene: scene,
				src: scene.assets["shot"],
				width: (scene.assets["shot"] as g.ImageAsset).width,
				height: (scene.assets["shot"] as g.ImageAsset).height
			});

			// 弾の初期座標を、プレイヤーの少し右に設定します
			shot.x = player.x + player.width;
			shot.y = player.y;
			shot.update.add(() => {
				// 毎フレームで座標を確認し、画面外に出ていたら弾をシーンから取り除きます
				if (shot.x > g.game.width) shot.destroy();

				// 弾を右に動かし、弾の動きを表現します
				shot.x += 10;

				// 変更をゲームに通知します
				shot.modified();
			});
			scene.append(shot);
		});
		const updateHandler = () => {
			if (this.time <= 0) {
				// RPGアツマール環境であればランキングを表示します
				if (this.param.isAtsumaru) {
					const boardId = 1;
					window.RPGAtsumaru.experimental.scoreboards.setRecord(boardId, g.game.vars.gameState.score).then(function () {
						window.RPGAtsumaru.experimental.scoreboards.display(boardId);
					});
				}
				scene.update.remove(updateHandler); // カウントダウンを止めるためにこのイベントハンドラを削除します
			}
			// カウントダウン処理
		};
		scene.update.add(updateHandler);
		// ここまでゲーム内容を記述します

	}

}
