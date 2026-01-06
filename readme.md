## Raycast Demo (JS & P5)

<div align="center">
<img src="https://i.imgur.com/o2ke3V4.png?1">
</div>
<br>

[Live Demo](https://js-raycast-b6a9a6ff6db1.herokuapp.com/)

Browser-based raycasting that renders a pseudo-3D environment using traditional raycasting algorithms. This project demonstrates how raycasting can be used to create a first-person perspective view of a 2D grid-based map, similar to classic games like Wolfenstein 3D.

### Features

- Real-time raycasting engine with field-of-view calculations
- Interactive first-person navigation
- Minimap visualization showing player position and raycasts
- Distance-based shading for depth perception
- Static file server w/ express

### Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   Or for production:

   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:3000`

### Controls

- **Arrow Keys**: Move forward, backward, and turn left/right

### Related Projects

A more thorough implementation in C featuring rudimentary textures can be found [here](https://github.com/emboiko/C_Raycast).
