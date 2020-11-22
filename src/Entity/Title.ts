import { BaseEntity } from "./BaseEnttity";
import { BaseScene, IobjE } from "../Scene/SceneBase";
import { Timeline } from "@akashic-extension/akashic-timeline";
import { easeOutSine } from "@akashic-extension/akashic-timeline/lib/Easing";

export class Title extends BaseEntity {
	protected myentMakeOder: IobjE;
	protected titileSp: g.Sprite;
	protected setumeiSp: g.Sprite;

	protected rectS: g.FilledRect;
	protected damyE: g.E;
	protected timeline: Timeline;
	protected sc: g.Scene;
	constructor(protected _scene: BaseScene) {
		super(_scene);
		this.sc = _scene.scene;
		this.init();
		
	}
	public start() {
		this.timeline = new Timeline(this.sc);
		this.BaseEsp.scale(0);
		const x = this.BaseEsp.width;
		const y = this.BaseEsp.height;
		this.BaseEsp.moveTo(320, 120);
		this.BaseEsp.anchor( 0.5, 0.5);
		this.BaseEsp.modified();
		this.timeline.create(this.BaseEsp).scaleTo(1, 1, 500, easeOutSine)
											.con()
											.moveTo( 0, 0, 500, easeOutSine)
											.every(()=>{}, 300)
											.call(this.chSp)
											.fadeIn(4500);
											
	}
	public gameinit() {
		
	}
	public update(): void {
		;
	}
	protected spInit(): void {
		;
	}
	protected makeEnt(): g.E {
		const scene = this._scene.scene;
		this.damyE = new g.E({ scene: scene });
		this.rectS = new g.FilledRect({scene: scene, cssColor: "brack", width: 640, height: 340});
		this.rectS.opacity = 0.6;
		// this.rectS.hide();
		this.damyE.append(this.rectS);
		this.setumeiSp = this._scene.makeSprite("moguraSetumei");
		this.titileSp = this._scene.makeSprite("titile");
		
		// this.hSp.hide();
		this.damyE.append(this.setumeiSp);
		// this.damyE.append(this.hSp);
		this.BaseEsp.append(this.titileSp);
		return this.BaseEsp;
	}

	protected chSp = () => {
		this.BaseEsp.remove(this.titileSp);

		this.BaseEsp.append(this.damyE);
		// this.rectS.show();
		// this.setumeiSp.opacity = 1;
	}
	
	protected takeSceneFromMess(tkobj: any): void {
		;
	}
}