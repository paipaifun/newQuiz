import { GZPlatform } from "./gzplatform";

export interface ActionData {
  type: string | undefined;
}

export interface PlayAsyncData {
  type: "play_async";
  inviterID?: string;
  joinerID?: string;
}

export interface PlayRewardData {
  type: "reward" | "joined";
  joinedID: string;
}

export class PlayingAsync {
  base64image: string;

  constructor(base64image: string) {
    this.base64image = base64image;
  }

  async invite() {
    if (!GZPlatform.hasFBInstant) {
      return;
    }

    if (window.onGameStarted) {
      await window.onGameStarted();
    }

    await FBInstant.context.chooseAsync();

    const data: PlayAsyncData = {
      type: "play_async",
      inviterID: FBInstant.player.getID() ?? "",
    };

    const name = FBInstant.player.getName();
    if (name == undefined) {
      throw new Error("name is undefined, please check the game is started");
      return;
    }

    await FBInstant.updateAsync({
      action: "CUSTOM",
      template: "invite_play_turn",
      cta: "Play now!",
      image: this.base64image,
      text: `${name} has played the game, it's your turn!`,
      data,
    });
  }

  // TODO: 实验中
  async onPlayReward(): Promise<PlayRewardData | undefined> {
    if (!GZPlatform.hasFBInstant) {
      return;
    }

    if (window.onGameStarted) {
      await window.onGameStarted();
    }

    const data: PlayAsyncData = FBInstant.getEntryPointData();
    console.log("entry point:", JSON.stringify(data));
    if (
      data == null ||
      typeof data.type !== "string" ||
      data.type !== "play_async"
    ) {
      return;
    }

    const playId = FBInstant.player.getID();
    if (playId == undefined || data.inviterID == undefined) {
      return;
    }

    if (playId === data.inviterID) {
      if (data.joinerID == undefined) {
        return;
      }
      return {
        type: "reward",
        joinedID: data.joinerID,
      };
    }

    if (data.joinerID != undefined) {
      return;
    }
    // await FBInstant.updateAsync({
    //   action: "CUSTOM",
    //   template: "invite_earned_reward",
    //   cta: "Play now!",
    //   image: "",
    //   text: "You’ve earned a reward!",
    //   data: {
    //     type: "play_async",
    //     inviterID: data.inviterID,
    //     joinerID: playId,
    //   },
    // });
    // return {
    //   type: "joined",
    //   joinedID: playId,
    // };
  }
}
