const handPoseDetection = require('@tensorflow-models/hand-pose-detection');
import RockGesture from './gesture/RockGesture';
require('@mediapipe/hands')
const model = handPoseDetection.SupportedModels.MediaPipeHands;
const detectorConfig = {
  runtime: 'mediapipe', // or 'tfjs'
  modelType: 'full',
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
};

var detector;

const fp = require('fingerpose')
// import * as fp from 'fingerpose'

console.log(fp);
const gesture = [
    fp.Gestures.ThumbsUpGesture, fp.Gestures.VictoryGesture
]


const gestureEstimator = new fp.GestureEstimator(gesture)

const states = {
    video: null,
    canvas: {
        el: null, context: null
    },
    detectbtn: null,
    models: {
        handpose:{
            model: null,
            predictions: null
        },
    }


}

async function predictGesture(sourceElement, minimumScore) {
    const hands = await detector.estimateHands(states.video);
    

    if(hands.length > 0){
        console.log('have hands detected', hands);
        hands[0].keypoints.forEach(finger => {
            drawPoint(states.canvas.context, finger.x, finger.y)  
        })
    }
    
    return '';
}

document.addEventListener('DOMContentLoaded', async ()=>{
    states.video          = document.getElementById('video-input')
    states.canvas.el      = document.getElementById('out-video')
    states.canvas.context = states.canvas.el.getContext('2d')
    detector = await handPoseDetection.createDetector(model, detectorConfig);

    states.detectbtn     = document.getElementById('detectbtn')

    states.detectbtn.addEventListener('click', () => {
        detectHandPose()
    })

    loadModels().then(() => {
        camEvent(states.video)
        openCam()
    })
})




// ML Model 
async function loadModels(){
    states.models.handpose.model = await handpose.load() 
}

async function detectHandPose(){
    const predictions = await predictGesture(states.video, 21)
    console.log(predictions);
}

// Video live cam

function drawVideo(){
    console.log(states.video.width);
    // states.canvas.el.width = 
    states.canvas.context.drawImage(states.video, 0, 0, states.canvas.el.width, states.canvas.el.height)
}

function openCam(){
    if(navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 720 }, 
                height: { ideal: 480 } 
            }
        })
        .then((stream) => {
            states.video.srcObject = stream
        }).catch(error => {
            console.log(error);
        })
    }
}

function camEvent(video){
    video.addEventListener('loadeddata', () => {
        console.log('video data loaded');
        (async function loop(){
            if(!video.paused && !video.ended){
                
                drawVideo()
                await predictGesture(states.video, 21)
                setTimeout(loop, 20)
            }
        })()
    })
}

function drawPoint(context, x, y){
    context = states.canvas.context
    
    var size = 5

    context.fillStyle = 'red';
    context.fillRect(x + 4, y, size, size);
    
}