# Phoenix JS

This package contains the extracted JavaScript code from the Phoenix framework. It is automatically updated to match the latest Phoenix version.

## Overview

Phoenix JS provides client-side JavaScript functionality for Phoenix applications. It includes modules for managing WebSocket connections, handling channels, and implementing real-time features.

## Installation

To install this package, add the following to your `package.json`:

```json
"dependencies": {
  "@guess/phoenix-js": "^1.7.14"
}
```

Then run:

```
npm install
```

## Usage

Import the Phoenix modules in your JavaScript code:

```javascript
import { Socket, Channel, Presence } from "@guess/phoenix-js";
```

For detailed usage instructions, please refer to the [Phoenix JavaScript documentation](https://hexdocs.pm/phoenix/js/index.html).

## Key Features

- WebSocket management with `Socket`
- Channel-based real-time communication
- Presence tracking for user state synchronization

## Automatic Updates

This package is automatically updated to match the latest version of Phoenix. A GitHub Action runs daily to check for new Phoenix releases and updates this package accordingly.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Resources

- [Phoenix Framework GitHub Repository](https://github.com/phoenixframework/phoenix)
- [Phoenix JavaScript Documentation](https://hexdocs.pm/phoenix/js/index.html)
- [Phoenix Framework Website](https://www.phoenixframework.org/)

## License

This project is licensed under the MIT License.

## Acknowledgements

This package is based on the JavaScript code from the Phoenix framework, created and maintained by the Phoenix Core Team and contributors.
