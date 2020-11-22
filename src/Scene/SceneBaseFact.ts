export interface IGameSinarioT {
	hoge(fscene: g.Scene): void;
}


export class SceneFact {

	
	// private _assetIds: string[];
	private  _game: g.Game = g.game;
	private _scene: g.Scene;
	// private _gameSinario: (fscene: g.Scene) => void;

	constructor(private _assetIds?: string[], private _gameSinario?: (fscene: g.Scene) => void) {
		// _gameSinario = this.fsla;
		this.makescene();
	}
	get scene() {
		return this._scene;
	}
	set scene(scene: g.Scene) {
		this._scene = scene;
	}
	get assetIds() {
		return this._assetIds;
	}
	set assetIds(assetIds: string[]) {
		this._assetIds = assetIds;
	}
	get gameSinario() {
			return this._gameSinario;
	}
	set gameSinario(gameSinario) {
		this._gameSinario = gameSinario;
	}
	public init() {
		this.makescene();
	}

	public makescene() {
		this._scene = new g.Scene({
				game: this._game,
				assetIds: this._assetIds
		});
		this._scene.loaded.add( () => this.fsla(this._scene));
		return this._scene;

	}
	public getScene = () => {
		return this._scene;
	}
	protected fsla = (fscene: g.Scene) => {
	
	}

}
