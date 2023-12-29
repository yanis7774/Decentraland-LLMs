import {Schema, MapSchema, type} from "@colyseus/schema";

export class Player extends Schema {
    @type('string') address: string;
    @type('string') name: string;
    @type('string') email: string;
    @type("boolean") connected: boolean;
    @type('string') pendingSessionId: string;
    @type('number') pendingSessionTimestamp: number;
    @type('string') activeSessionId: string;
    @type('number') level: number;
    @type('number') xp: number;
    @type('number') currency: number;
    @type('boolean') banned: boolean;
    @type('string') furnitureJson: string;
    adminStatus: boolean = false;
    noWeb3: boolean = false;
    flatKeys: any[] = [];
    statActionList: {type: string, action: string}[] = [];
    currentFlat: string = "";
    roomTour: boolean = false;
    lotteryTickets: number = 0;
    dailyRewardLimit: number = 0;
    dailyRewardFloor: string = "";
    dailyRewardCoins: number = 0;
    dailyRewardLast: Date = new Date();
    dailyRewardHint: number[] = [];
    rewardTimerStamp: Date | undefined;
    inworldConnection: any = undefined;
    inworldClient: any = undefined;

    constructor(rewardLimit: number, rewardFloor: string, rewardLast: Date, rewardCoinAmount: number, rewardTimerStamp: Date | undefined) {
        super();
        this.dailyRewardLimit = rewardLimit;
        this.dailyRewardFloor = rewardFloor;
        this.dailyRewardLast = rewardLast;
        this.dailyRewardCoins = rewardCoinAmount;
        this.rewardTimerStamp = rewardTimerStamp;
    }

}




export class MainRoomState extends Schema {
    @type("number") countdown: number;
    @type({map: Player}) users = new MapSchema<Player>();
}
