# Smart Password Strength Detector

A simple and powerful tool that analyzes password strength and estimates how long it would take to crack using brute-force techniques. This project helps users create stronger, more secure passwords by understanding character complexity, entropy, and crack-time calculation.

## Features

* Checks overall password strength
* Calculates estimated crack time
* Detects lowercase, uppercase, numbers, and symbols
* Uses mathematical probability for combinations
* Provides suggestions for stronger passwords
* Fully client-side — no password data stored
* Clean, responsive UI
* Fast and lightweight

## Live Demo

 https://passwordcheckerapp.web.app

## Tech Stack

* HTML
* CSS
* JavaScript
* Firebase Hosting
* AI Model

## How It Works

The tool calculates the total number of possible password combinations based on the character set:

```
Lowercase letters → 26  
Uppercase letters → 26  
Numbers           → 10  
Symbols           → 33 (approx.)
```

Formula used:

**Crack Time = Total Possibilities / Guesses per Second**

Example JavaScript logic:

```javascript
const password = input.value;
const length = password.length;
let charset = 0;

if(/[a-z]/.test(password)) charset += 26;
if(/[A-Z]/.test(password)) charset += 26;
if(/[0-9]/.test(password)) charset += 10;
if(/[^a-zA-Z0-9]/.test(password)) charset += 33;

const possibilities = Math.pow(charset, length);
const guessesPerSec = 1e9;
const crackTime = possibilities / guessesPerSec;
```

## Installation & Usage

1. Clone the repository:

```
git clone https://github.com/mdebabrata2004/Smart-Password-Strength-Detector.git
```

2. Open `index.html` in any browser.
3. Enter any password and instantly see its strength and crack time.
4. Optional: Deploy using Firebase:

```
firebase deploy
```

## Inspiration

Weak passwords are one of the biggest reasons behind hacking, data breaches, and identity theft. This project was created to make password security simple and understandable for everyone.

## What We Learned

* Password entropy and probability calculations
* JavaScript regex for character pattern detection
* Designing clean UI/UX
* Firebase Hosting deployment
* Importance of strong password practices

## Challenges We Faced

* Designing the strength calculation algorithm
* Making crack-time readable and user-friendly
* Handling Firebase hosting issues
* Keeping the UI simple yet appealing

## Future Improvements

* AI-based password generator
* Breach database checking
* Browser extension version
* Dark mode support
* Mobile-friendly redesign

## Credits (IMPORTANT)

This project was created and developed by **Debabrata Mondal**.

If you use this project (fully or partially), you **must** give proper visible credit to:

**Developer: Debabrata Mondal**

Failure to give credit when using or publishing this project gives the creator full rights to take appropriate legal action.

Respect the developer’s effort and creativity.


## Contact

For collaboration, improvements, or support:

**Debabrata Mondal**
Email: m.debabrata3773@gmail.com


