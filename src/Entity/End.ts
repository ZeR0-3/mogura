import { BaseEntity } from "./BaseEnttity";
import { BaseScene, IobjE } from "../Scene/SceneBase";

export class End extends BaseEntity {
	protected myentMakeOder: IobjE;
	protected endSp: g.Sprite;
	constructor(protected _scene: BaseScene) {
		super(_scene);
		this.init();
		
	}
	public update(): void {
		;
	}
	protected spInit(): void {
		;
	}
	protected makeEnt(): g.E {
		const scene = this._scene.scene;
		this.endSp = this._scene.makeSprite("gameend");
		this.BaseEsp.append(this.endSp);
		return this.BaseEsp;
	}
	protected takeSceneFromMess(tkobj: any): void {
		;
	}
}