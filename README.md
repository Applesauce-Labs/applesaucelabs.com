# Applesauce Labs Website

Welcome to the Applesauce Labs website repository! This site is built using [Docusaurus 3](https://docusaurus.io/) and is hosted on GitHub Pages. This README provides instructions for setting up the development environment, testing changes, and deploying updates to the live site.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Personal Access Token Setup](#personal-access-token-setup)
- [Testing Changes](#testing-changes)
- [Deployment](#deployment)
- [Additional Resources](#additional-resources)

---

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js**: 20.16.0 (higher versions are probably fine)

You can check your Node.js version by running:

```bash
node -v
```

If you don't have it, you can download it from the [official website](https://nodejs.org/)


- **Yarn**: 1.22.22 [https://yarnpkg.com/getting-started](https://yarnpkg.com/getting-started)

```bash
yarn --version
```

To install Yarn globally using npm, simply run the following command:

```bash
npm install -g yarn
``` 



## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Applesauce-Labs/applesaucelabs.com.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd applesaucelabs.com
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```


## Development Setup

### 1. Personal Access Token Setup

To deploy the site to GitHub Pages, you need a GitHub Personal Access Token (PAT) with the appropriate permissions.

#### a. Generate a Personal Access Token

1. **Navigate to GitHub Settings**

   Go to your GitHub profile and click on **Settings**.

2. **Access Developer Settings**

   Scroll down and select **Developer settings**.

3. **Create a New Token**

   - Click on **Personal access tokens**.
   - Choose **Tokens (classic)** (if applicable).
   - Click on **Generate new token**.

4. **Set Token Permissions**

   - **Note**: For security, it's best to grant the least permissions necessary.
   - Under **Scopes**, select:

     - `repo` (Full control of private repositories)

5. **Generate and Copy the Token**

   - Click **Generate token** at the bottom.
   - **Copy** the generated token and store it securely. You won't be able to see it again.

#### b. Set the Environment Variable

You need to make the token available to the `gh-pages` deployment script.

1. **Set the `GH_TOKEN` Environment Variable**

   - **For Unix/Linux/MacOS:**

     ```bash
     export GH_TOKEN=your_personal_access_token
     ```

   - **For Windows (Command Prompt):**

     ```cmd
     set GH_TOKEN=your_personal_access_token
     ```

   - **For Windows (PowerShell):**

     ```powershell
     $env:GH_TOKEN="your_personal_access_token"
     ```

   > **Note**: Replace `your_personal_access_token` with the token you generated.

2. **Persistent Environment Variable (Optional)**

   To avoid setting the environment variable every time, you can add it to your shell profile (e.g., `~/.bashrc`, `~/.zshrc`).

   ```bash
   echo 'export GH_TOKEN=your_personal_access_token' >> ~/.bashrc
   source ~/.bashrc
   ```

## Testing Changes

### 1. Run the Development Server

Start the development server to test your changes locally.

```bash
npm run start
```

- **Access the Site Locally**

  Open your browser and navigate to `http://localhost:3000`.

- **Hot Reloading**

  The development server supports hot reloading. Any changes you make to the source files will automatically refresh the page.

### 2. Build the Site Locally

To test the production build locally:

```bash
npm run build
```

This command generates the static files in the `build` directory.

### 3. Serve the Built Site Locally

```bash
npm run serve
```

- **Access the Site**

  Open your browser and navigate to `http://localhost:3000`.

- **Purpose**

  This allows you to test the production version of the site locally before deploying.

## Deployment

When you're ready to deploy your changes to the live site, follow these steps.

### 1. Build the Site

Generate the production build:

```bash
npm run build
```

### 2. Deploy to GitHub Pages

Deploy the `build` directory to the `gh-pages` branch:

```bash
npm run deploy
```

- **What Happens**

  The `gh-pages` package uses the `GH_TOKEN` to authenticate and push the contents of the `build` directory to the `gh-pages` branch.

- **Successful Deployment**

  Upon success, you should see:

  ```
  Published
  ```


## Additional Resources

- **Docusaurus Documentation**

  - [Getting Started](https://docusaurus.io/docs)
  - [Configuration](https://docusaurus.io/docs/configuration)
  - [Deployment](https://docusaurus.io/docs/deployment)

- **GitHub Pages**

  - [GitHub Pages Documentation](https://docs.github.com/en/pages)
  - [Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

- **gh-pages Package**

  - [gh-pages on npm](https://www.npmjs.com/package/gh-pages)
  - [GitHub Repository](https://github.com/tschaub/gh-pages)

---

If you encounter any issues or have questions, feel free to create an issue or contact the repository maintainers.

**Happy coding!**
