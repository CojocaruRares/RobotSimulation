
//Robot class
class Robot {
  constructor(serialNumber, activationRound, deactivationRound) {
    this.serialNumber = serialNumber;
    this.activationRound = activationRound;
    this.deactivationRound = deactivationRound;
    this.active = false;
    this.health = true;
  }

  //set the robot to active state if current round is equal to activation round
  activate(currentRound) {
    if (currentRound === this.activationRound) {
      this.active = true;
    }
  }

  //robot becomes inactive when current round reaches deactivation round
  deactivate(currentRound) {
    if (currentRound === this.deactivationRound) {
      this.active = false;
    }
  }

  generatePoint() {
    //if the robot is active and healthy and the workload number is below or equal to 90, generate a point.
    if (this.active && this.health) {
      //random number between 1 and 100
      const workloadResult = Math.floor(Math.random() * 100) + 1;
      if (workloadResult <= 90) {
        return 1;
      }
      //if the workload value is above 90, the robot breaks and becomes unhealthy 
      else {
        this.health = false;
        return 0;
      }
    }
    //if round starts and the robot is broken, we lose 10 points 
    else if (this.active && !this.health) {
      return -10;
    }
    //otherwise, it means the robot is inactive and nothing happens 
    else {
      return 0;
    }
  }
}

//Controller class
class Controller {
  constructor(controllerId) {
    this.controllerId = controllerId;
    this.interactions = 0;
  }

  //the controller is limited to 100 robot interactions
  overheat() {
    if (this.interactions >= 100) {
      this.interactions = 0;
      return true;
    } else return false;
  }

  //3 types of interactions: 
  //-read robot active status
  //-read robot health
  //-repair robot
  interactWithRobot(robot) {
    //perform the first 2 interactions
    const robotActiveStatus = robot.active;
    const robotHealthStatus = robot.health;
    //if robot is broken --> repair robot
    if (robotActiveStatus && !robotHealthStatus) {
      robot.health = true;
      this.interactions += 3;
    } else {
      this.interactions += 2;
    }
  }
}

function simulate() {
  let totalPoints = 0;
  const totalRounds = 60;
  const robots = [];
  const controllers = [];

  //initialize robots
  for (let i = 0; i < 10000; i++) {
    const activationRound = Math.floor(Math.random() * 30) + 1;
    const deactivationRound = Math.floor(Math.random() * 31) + 30;
    const robot = new Robot(i, activationRound, deactivationRound);
    robots.push(robot);
  }

  //initialize controllers
  for (let i = 0; i < 100; i++) {
    const controller = new Controller(i);
    controllers.push(controller);
  }

  //simulation loop
  for (let roundNumber = 1; roundNumber <= totalRounds; roundNumber++) {
    let roundPoints = 0;

    //activate or deactivate robots based on current round number
    robots.forEach((robot) => {
      robot.activate(roundNumber);
      robot.deactivate(roundNumber);
    });

    //generate points from active robots
    robots.forEach((robot) => {
      roundPoints += robot.generatePoint();
    });

    //controller interactions
    controllers.forEach((controller) => {
      //there are 100 controllers
      //each controller can monitor 100 robots
      //controller with ID=0 will monitor robots with IDs between 0 and 99
      //controller with ID=1 will monitor robots with IDs between 100 and 199
      //and so on
      for (let i = 0; i < 100; i++) {
        const robotIndex = 100 * controller.controllerId + i;
        //check if the robot is worth repairing
        //if from current round, the robot will remain active for at least 3 more rounds then repair it
        if (robots[robotIndex].deactivationRound - roundNumber >= 3) {
          controller.interactWithRobot(robots[robotIndex]);
          //if controller has performed 100 interactions, it means it reached maximum effort
          //consume 20 points 
          if (controller.overheat()) roundPoints -= 20;
        }
      }
    });

    totalPoints += roundPoints;
    console.log(`Round ${roundNumber} --> Total Points: ${totalPoints}`);
  }
}

simulate();
