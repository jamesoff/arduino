#define LEFT_PIN  2
#define RIGHT_PIN 3

#define LEFT_LED  11
#define RIGHT_LED 12

// milliseconds which must pass between button presses
// for them to count
// helps debounce the press but (with higher values)
// will stop people voting too quickly
#define MIN_TIME  1000

// volatile because we're updating in an ISR
volatile int leftMachine = 0;
volatile int rightMachine = 0;

// last button press for each side
volatile unsigned long leftTime = 0;
volatile unsigned long rightTime = 0;



void setup() {
	// put your setup code here, to run once:
	Serial.begin(9600);

	digitalWrite(LEFT_PIN, HIGH);
	digitalWrite(RIGHT_PIN, HIGH);

	pinMode(LEFT_LED, OUTPUT);
	pinMode(RIGHT_LED, OUTPUT);

	attachInterrupt(0, leftPinPressed, FALLING);
	attachInterrupt(1, rightPinPressed, FALLING);
}


void loop() {
	// put your main code here, to run repeatedly:

	Serial.print("{\"left\":");
	Serial.print(leftMachine);
	Serial.print("; \"right\":");
	Serial.print(rightMachine);
	Serial.println("}");

	if (leftMachine > rightMachine) {
		digitalWrite(LEFT_LED, HIGH);
		digitalWrite(RIGHT_LED, LOW);
	}
	else if (leftMachine < rightMachine) {
		digitalWrite(LEFT_LED, LOW);
		digitalWrite(RIGHT_LED, HIGH);
	}
	else {
		digitalWrite(LEFT_LED, HIGH);
		digitalWrite(RIGHT_LED, HIGH);
	}

	delay(1000);
}


void leftPinPressed() {
	if (millis() - leftTime >= MIN_TIME) {
		leftMachine++;
		leftTime = millis();
	}
}


void rightPinPressed() {
	if (millis() - rightTime >= MIN_TIME) {
		rightMachine++;
		rightTime = millis();
	}
}

