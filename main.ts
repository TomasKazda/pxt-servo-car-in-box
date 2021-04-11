basic.forever(function () {
    serial.writeValue("s1", s1)
    serial.writeValue("s2", s2)
    basic.pause(100)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    setS1 = !setS1
    if (setS1)
        basic.showNumber(1)
    else 
        basic.showNumber(2)
})
input.onButtonPressed(Button.A, function () {
    if (setS1 && s1 > -100) {
        s1 -= 5
        servos.P1.run(s1)
    }
    else if (!setS1 && s2 < 100) {
        s2 += 5
        servos.P2.run(s2)
    } else {
        music.playTone(Note.C, 200)
    }
})
input.onButtonPressed(Button.B, function () {
    if (setS1 && s1 < 100) {
        s1 += 5
        servos.P1.run(s1)
    }
    else if (!setS1 && s2 > -100) {
        s2 -= 5
        servos.P2.run(s2)
    } else {
        music.playTone(Note.C, 200)
    }
})
let setS1 = true
let s1 = -30
let s2 = 30
servos.P1.setStopOnNeutral(true)
servos.P2.setStopOnNeutral(true)
basic.showNumber(1)
servos.P1.run(s1)
servos.P2.run(s2)