import { connect, NatsConnection, StringCodec } from 'nats';
import pool from './db';
import { updateAudioPath, updateMediaPath, areAudioAndMediaPathsUpdated, getIdAndPaths } from './services/video';

export default class App {

    private sc = StringCodec();
    private server: string = 'nats://82.197.65.146:4222';
    private nc: NatsConnection;

    private async init() {
        try {
            console.info('-> Connecting to NATS...');
            this.nc = await connect({ servers: this.server });
            console.info('-> Connected to NATS');

            console.info('-> Trying to connect to DB...');
            const db = await pool.connect();
            await db.release();
            console.info('-> Connected to DB');
        } catch (error) {
            console.error(`[x] Error connecting to services: ${error}`);
        }
    }

    private async jobCompletedHandler(instance: any, proccedure: any) {
        const subj = instance.getSubject();
        console.log(`Listening for ${subj}`);

        for await (const msg of instance) {
            const data = JSON.parse(this.sc.decode(msg.data));
            console.log(`[${subj}] #${instance.getProcessed()} - ${msg.subject} ${msg.data ? ' ' + JSON.stringify(data) : ''}`);
            await proccedure(pool, data);
            const pathsUpdated = await areAudioAndMediaPathsUpdated(pool, data.id);
            if (pathsUpdated) {
                const videoData = await getIdAndPaths(pool, data.id);
                if (videoData) {
                    console.log(`Publishing video created: ${JSON.stringify(videoData)}`);
                    this.nc.publish('job.video.created', this.sc.encode(JSON.stringify(videoData)));
                    console.log(`Video created published: ${JSON.stringify(videoData)}`);
                }
            }
        }
    }

    private async jobTTSCompletedHandler(instance: any) {
        await this.jobCompletedHandler(instance, updateAudioPath);
    }

    private async jobMediaCompletedHandler(instance: any) {
        await this.jobCompletedHandler(instance, updateMediaPath);
    }

    public async start() {
        await this.init();
        const ttsCompleted = this.nc.subscribe('job.tts.completed');
        const mediaCompleted = this.nc.subscribe('job.media.completed');

        this.jobTTSCompletedHandler(ttsCompleted);
        this.jobMediaCompletedHandler(mediaCompleted);
    }

}