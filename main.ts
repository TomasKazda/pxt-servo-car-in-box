radio.setGroup(19)

//set servo speed
basic.forever(function () {
    //serial.writeValue("ping", getMedian(lastDistances))
    if (Math.abs(sRight) + Math.abs(sLeft) < 20) 
    {
        servos.P1.run(0)
        servos.P2.run(0)
    } else {
        servos.P1.run((sRight + sRightTrim) * -1)
        servos.P2.run(sLeft + sLeftTrim)
    }
    //serial.writeValue("sR", sRight)
    //serial.writeValue("sL", sLeft)
    basic.pause(50)
})

//front obstacles
// basic.forever(function () {
//     if (checkFrontObstacles()) 
//     {
//         sLeft = 0;
//         sRight = 0;
//     }
//     basic.pause(333)
// })

//store 5 last distance measurement
basic.forever(function () {
    lastDistances.push(ping(DigitalPin.P8, DigitalPin.P9)); //1 - 29 ms
    lastDistances.shift();    

    basic.pause(100)
})

radio.onReceivedBuffer(function (receivedBuffer) {
    let x = receivedBuffer.getNumber(NumberFormat.Int16LE, 0)
    let y = receivedBuffer.getNumber(NumberFormat.Int16LE, 2)
    //serial.writeValue("x", x);
    //serial.writeValue("y", y);

    if (y >= 0)
    {
        if (checkFrontObstacles())
        {
            control.inBackground(function () {
                sRight = -66;  
                sLeft = -66;
                basic.pause(800)
                sRight = 0;  
                sLeft = 0;
            })
            music.playTone(Note.C, music.beat(BeatFraction.Quarter));
            music.rest(music.beat(BeatFraction.Sixteenth));
            music.playTone(Note.C, music.beat(BeatFraction.Quarter));
        } else {
            sRight = y - x;
            sLeft = y + x;
        }
    } else {
        sRight = y + x;
        sLeft = y - x;
    }
    
});


input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    setS1 = !setS1
    if (setS1)
        control.inBackground(function () {
            basic.showNumber(1)
            basic.pause(1000)
            basic.clearScreen()
        })
    else 
        control.inBackground(function () {
            basic.showNumber(2)
            basic.pause(1000)
            basic.clearScreen()
        })
})
input.onButtonPressed(Button.A, function () {
    if (setS1 && sRightTrim > -100) {
        sRightTrim -= 5
    }
    else if (!setS1 && sLeftTrim < 100) {
        sLeftTrim += 5
    } else {
        music.playTone(Note.C, 200)
    }
})
input.onButtonPressed(Button.B, function () {
    if (setS1 && sRightTrim < 100) {
        sRightTrim += 5
    }
    else if (!setS1 && sLeftTrim > -100) {
        sLeftTrim -= 5
    } else {
        music.playTone(Note.C, 200)
    }
})
let setS1 = true
let sRight = -0
let sLeft = 0
let sRightTrim = 0
let sLeftTrim = 0
let lastDistances = [999, 999, 999, 999, 999]
let irFL = DigitalPin.P16
let irFR = DigitalPin.P15
let irBL = DigitalPin.P13
let irBR = DigitalPin.P14

servos.P1.setStopOnNeutral(true)
servos.P2.setStopOnNeutral(true)
servos.P1.run(sRight)
servos.P2.run(sLeft)

let sosCoef = 1 / ((331 + 0.607 * (input.temperature()-4)) / 10000 / 2)
/**
 * Send a ping and get the echo time (in microseconds) as a result
 * @param trig tigger pin
 * @param echo echo pin
 * @param unit desired conversion unit
 * @param maxCmDistance maximum distance in centimeters (default is 500)
 */
//% blockId="sensor_ping" block="ping trig %trig|echo %echo|unit %unit"
function ping(trig: DigitalPin, echo: DigitalPin, maxCmDistance = 500): number {
    // send pulse
    pins.setPull(trig, PinPullMode.PullNone);
    pins.digitalWritePin(trig, 0);
    control.waitMicros(2);
    pins.digitalWritePin(trig, 1);
    control.waitMicros(10);
    pins.digitalWritePin(trig, 0);

    // read pulse in cm
    const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);
    return Math.round(d / sosCoef)
}

function getMedian(distances: Array<number>): number {
    let arr =  [];
    for (let i of distances) {
        arr.push(i);
    }
    let len = arr.length
    arr.sort((a, b) => a - b);
    const mid = Math.ceil(len / 2);
    return len % 2 == 0 ? (arr[mid] + arr[mid - 1]) / 2 : arr[mid - 1];
}

function checkFrontObstacles(): boolean {
    let result = false;
    if (pins.digitalReadPin(irFL) == 0 || pins.digitalReadPin(irFR) == 0) 
    {
        result = true;
    }
    let distance = getMedian(lastDistances);
    if (distance > 0 && distance < 15)
    {
        result = true;
    }
    
    return result;
}
