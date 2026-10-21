
// --------------------------------------------------
// SCENES
// Read through the comments below to see what this section does
//
// TO CUSTOMIZE THIS SECTION
// 1) add fields for each scene, as relevant, to match your mockup
// 2) customize the scenes to fit your story
// 3) add any new fields to the function below
// --------------------------------------------------

// First, we create a variable for the current scene being displayed
let currentScene = "bathroom";

// Then, we create an object that stores the data for each scene,
const scenes = {
  bathroom: {
    title: "FIND YOUR TOOTHBRUSH",
    text: "You just ate a bunch of Oreos and noticed a black spot on your tooth that looks like a cavity. Your dentist appointment is in 25 minutes, and you can't find your toothbrush! You check the cabinet under the sink and find toothpaste, but no toothbrush.",
    image: { alt: "Bathroom image" },
    onEnter: function () {
      if (!inventory.includes("toothpaste")) {
        pickUpItem("toothpaste");
      }
    },
    choices: [
      {
        text: "Go to the kitchen",
        timeCost: 2,
        nextScene: "kitchen"
      },
      {
        text: "Go to the living room",
        timeCost: 3,
        nextScene: "livingroom"
      }
    ]
  },

  kitchen: {
    title: "Kitchen",
    text: "You ask your mom if she's seen your toothbrush. She says she cleaned the bathroom earlier and put some things away, but doesn't remember where.",
    image: { alt: "Kitchen image" },
    onEnter: function () {
      messageDisplay.textContent = "Clue: Mom cleaned the bathroom.";
    },
    choices: [
      {
        text: "Go to the living room",
        timeCost: 2,
        nextScene: "livingroom"
      },
      {
        text: "Go to Mom's bedroom",
        timeCost: 4,
        requiresItem: "bedroom key",
        nextScene: "momsroom"
      }
    ]
  },

  livingroom: {
    title: "Living Room",
    text: "You look through a box of random stuff your mom moved while cleaning. You find some bathroom items and a small key that might unlock Mom's bedroom. There is no toothbrush, so you wonder where else she could've put it.",
    image: { alt: "Living room image" },
    onEnter: function () {
      messageDisplay.textContent = "Clue: Mom moved bathroom stuff.";
    },
    choices: [
      {
        text: "Search the box for the key",
        timeCost: 1,
        action: function () {
          pickUpItem("bedroom key");
          messageDisplay.textContent = "You found a key to Mom's bedroom.";
        }
      },
      {
        text: "Try Mom's bedroom",
        timeCost: 2,
        requiresItem: "bedroom key",
        nextScene: "momsroom"
      },
      {
        text: "Return to the bathroom",
        timeCost: 1,
        nextScene: "bathroom"
      }
    ]
  },

  momsroom: {
    title: "Mom's room",
    text: "You look through your mom's makeup stash and see a bunch of brushes. Then you spot your toothbrush mixed in with them! Your mom must've mistaken it for one of her brushes while cleaning.",
    image: { alt: "Makeup stash image" },
    choices: [
      {
        text: "Take the toothbrush",
        timeCost: 1,
        action: function () {
          pickUpItem("toothbrush");
        },
        nextScene: "ending"
      },
      {
        text: "Leave for the dentist",
        nextScene: "ending"
      }
    ]
  },

  ending: {
    title: "The Dentist",
    text: "",
    image: { src: "toothbrush.jpg", alt: "Toothbrush image" },
    onEnter: function () {
      if (inventory.includes("toothbrush") && inventory.includes("toothpaste")) {
        sceneText.textContent = "Good ending: You brush your teeth and the black Oreo stain comes off. You make it to the dentist and find out your teeth are fine!";
      } else {
        sceneText.textContent = "Bad ending: You leave without brushing and worry about the black spot, and the amateur dentist actually believes you have a cavity. You leave the dentist missing a tooth and with a bill for $200. Sorry...!";
      }
    },
    choices: [
      {
        text: "Play again",
        action: function () {
          inventory = [];
          inventoryDisplay.textContent = "";
          messageDisplay.textContent = "";
          time = 25;
          updateTime(0);
          updateScene("bathroom");
        }
      },
      {
        text: "End game",
        action: function () {
          choicesContainer.innerHTML = "";
          messageDisplay.textContent = "Game ended.";
        }
      }
    ]
  }
};

// --------------------------------------------------
// UPDATE SCENES
// Read through the comments below to see what this section does
//
// TO CUSTOMIZE THIS SECTION
// 1) add a new const variable for each new field you added above
// Make sure to match the ids used in your mock up with the fields 
// 2) set the .textContent of each variable to the corresponding field in the scene object
// Use sceneTitle as a model
// --------------------------------------------------

// First, we create variables to hold the references to the HTML elements
// Technically you could just use document.getElementById('id-name') 
// in the function itself, but that would be very wordy 
// and make the code harder to read
const sceneTitle = document.getElementById("scene-title");
const sceneText = document.getElementById("scene-text");
const sceneImage = document.getElementById("scene-image");
const choicesContainer = document.getElementById("choices-container");
const characterName = document.getElementById("character-name");

// Then, we create a function to update the scene,
function updateScene(sceneName) {

  //This update the variable currentScene with the new scene passed as a parameter
  currentScene = sceneName;

  //This accesses the scene object based on the scene name
  const scene = scenes[sceneName];

  // Here, for each html element, you change the textContent to match
  // the appropriate text from the scene object
  sceneTitle.textContent = scene.title;
  sceneText.textContent = scene.text;
  characterName.textContent = scene.character || "";
  messageDisplay.textContent = "";
  sceneImage.hidden = !scene.image.src;
  if (scene.image.src) {
    sceneImage.src = scene.image.src;
  }
  sceneImage.alt = scene.image.alt;

  // Clear the old buttons before creating new ones
  choicesContainer.innerHTML = "";

  if (scene.onEnter) {
    scene.onEnter();
  }

  // Loop through each choice in the scene, connecting an action and nextScene if included
  scene.choices.forEach(function (choice) {
    const button = document.createElement("button");

    button.textContent = choice.timeCost
      ? `${choice.text} (-${choice.timeCost} min)`
      : choice.text;

    button.addEventListener("click", function () {
      if (choice.requiresItem && !inventory.includes(choice.requiresItem)) {
        messageDisplay.textContent = "The door is locked. Find the key in the living room first.";
        return;
      }

      if (choice.action) {
        choice.action();
      }

      if (choice.timeCost) {
        updateTime(-choice.timeCost);
      }

      if (choice.nextScene) {
        updateScene(choice.nextScene);
      }
    });

    choicesContainer.appendChild(button);
  });
}

// --------------------------------------------------
// TIME
// --------------------------------------------------

// Create a variable for the time remaining
let time = 25;

// Display time remaining
const timeDisplay = document.getElementById("time-display");

// Create a function to update time
function updateTime(amount) {
  time = Math.max(0, time + amount);
  timeDisplay.textContent = time + " minutes";
}

// This refreshes the time display
updateTime(0);

// --------------------------------------------------
// INVENTORY
// Read through the comments below to see what this section does
//
// For now, you are probably leaving this section as is. 
// --------------------------------------------------

// Create a variable for inventory
let inventory = [];

// Display current inventory
const inventoryDisplay = document.querySelector("#inventory-display");
const messageDisplay = document.getElementById("message-display");

// Create a function to update inventory 
function pickUpItem(itemName) {
    // Add itemName to the inventory array
    // Show the updated inventory on the page
  if (!inventory.includes(itemName)) {
    inventory.push(itemName);
  }
  inventoryDisplay.textContent = inventory.join(", ");
}

// This updates the screen with the current scene
updateScene(currentScene);
