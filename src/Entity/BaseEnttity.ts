import { IobjE, BaseScene } from "../Scene/SceneBase";
export abstract class BaseEntity {
	protected abstract myentMakeOder: IobjE;
	/** ベースになるE */
	protected  _BaseEsp: g.E;
	constructor(protected _scene: BaseScene) {
		this._BaseEsp = new g.E(_scene);
	}
	/** BaseAbstのベースEを返す */
	get BaseEsp(): g.E {
		return this._BaseEsp;
	}
	/** レイヤーEにベリーになっているEをアタッチする */
	public addSP2Scene(lyar: g.E) {
		lyar.append(this.BaseEsp);
	}
	public abstract update(): void;

	protected init() {
		this._BaseEsp = this.makeEnt();
		// this.myentMakeOder.assetSP = this.sp;
		this.spInit();
	}
	/**
	 * Sp(E)実態の作成後X,Y座標などの初期化
	 */
	protected abstract spInit(): void;
	/** ベースのsp(E)に必要に応じてスプライトなど載せて返す */
	protected abstract makeEnt(): g.E;

	protected abstract takeSceneFromMess(tkobj: any ): void;
}
