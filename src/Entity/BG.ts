import { BaseEntity } from "./BaseEnttity";
import { BaseScene, IobjE } from "../Scene/SceneBase";
import { Title } from "./Title";
import { Timeline } from "@akashic-extension/akashic-timeline";

export class Bg extends BaseEntity {
	// protected sp: g.E;

	protected myentMakeOder: IobjE;
	protected bGsp: g.Sprite;
	protected bGsp1: g.Sprite;
	protected tmineline: Timeline;
	constructor(protected _scene: BaseScene) {
		super(_scene);
		this.init();
	}

	protected init() {
		// this.sp = new g.E({ scene: this._scene.scene });
		this.bGsp = this.makeEnt();
		this.BaseEsp.append(this.bGsp);

	}
	spInit(){};
	// tslint:disable-next-line:member-ordering
	makeEnt() {
		const scene = this._scene.scene;
		this.bGsp = this._scene.makeSprite("bg");
		this.bGsp1 = this._scene.makeSprite("bg1");
		this,this.bGsp1.opacity = 0;
		this.bGsp.append(this.bGsp1);
		return this.bGsp;
	}
	update(){}
	gameInit() {
		this.bGsp1.opacity = 0;
		this.bGsp1.modified();
	}
	cngBg() {
		const scene = this._scene.scene;
		this.tmineline = new Timeline(this._scene.scene);
		this.tmineline.create(this.bGsp1).to({opacity: 1}, 1000)

	}
	
	takeSceneFromMess() { }
}
