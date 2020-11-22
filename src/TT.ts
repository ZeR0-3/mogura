// tslint:disable-next-line: no-use-before-declare
// export = Test1;

export class Test1 {
    constructor(){}
    public makeScene = (): g.Scene => {
        const scene = new g.Scene({
            game: g.game,
            // このシーンで利用するアセットのIDを列挙し、シーンに通知します
            assetIds: ["player", "shot", "se"]
        });
        return scene;
    }
}
