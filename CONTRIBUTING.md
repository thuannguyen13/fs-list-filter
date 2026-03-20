# Attributes Contributing Guide

We're excited to have you here! This guide will help you understand how to contribute to the Attributes project. Whether you're a seasoned developer or just starting out, we appreciate your interest in helping us improve our library.

If you're new to open source, you might want to check the [Open Source Guides](https://opensource.guide/) website for some great resources on how to get started.

## New Attributes

If you want to propose a completely new Attribute solution, please [create an RFC](https://github.com/finsweet/attributes/discussions). A good Request for Comments (RFC) should include:

- A clear description of the new Attribute solution and its purpose.
- A breakdown of all the HTML attributes that will be used.
- A use case example.

## Bugs

We use [GitHub Issues](https://github.com/finsweet/attributes/issues) to track bugs and feature requests. If you would like to report a problem, take a look around and see if someone already opened an issue about it. If you are certain this is a new unreported bug, you can submit a bug report.

If you have questions about using Attributes, please use the [Finsweet forum](https://forum.finsweet.com/). The issue list of this repository is exclusively for bugs and feature requests.

### Reporting new issues

When [opening a new issue](https://github.com/finsweet/attributes/issues/new/choose), always make sure to fill out the issue template. This step is very important! Not doing so may result in your issue not being managed in a timely fashion.

- One issue, one bug: Please do not combine multiple issues into one.
- Provide reproducible steps: Include a clear set of steps to reproduce the issue. This will help us understand the problem better and fix it faster.

## Pull requests

If you would like to request a new feature or enhancement but are not yet thinking about opening a pull request, you can also file an issue with the [feature template](https://github.com/finsweet/attributes/issues/new?template=feature_request.md).

If you're only fixing a bug, it's fine to submit a pull request right away, but we still recommend that you file an issue detailing what you're fixing. This is helpful in case we don't accept that specific fix but want to keep track of the issue.

Small pull requests are much easier to review and more likely to get merged.

### Installation

Ensure you have [pnpm](https://pnpm.io/installation) installed. After cloning the repository, run `pnpm install`.

### Developing

You can start a local development server with `pnpm dev`. This will compile the library and watch for changes. The library will be available at `http://localhost:3000/attributes.js`.

### Creating a branch

For [the repository](https://github.com/finsweet/attributes) and create your branch from `master`.
If you need to create a fix for Attributes v1, create a branch from `v1` instead.

### Testing

All tests are located in `packages/attributes/tests`. Each Attribute solution has its own test file.

You can run all tests with `pnpm test`.

### Liting and typechecking

Always lint and typecheck your code before submitting a pull request. You can do this with `pnpm lint` and `pnpm check`.

## Project Structure

This repository employs a monorepo setup using [pnpm Workspaces](https://pnpm.io/workspaces).

Each package is located in the `packages` directory:

- `attributes`: The core library. It's the one in charge of dynamically importing the other packages during runtime.
- `utils`: A collection of utility functions used across the library.
- `template`: A template for creating new Attributes. It includes a basic structure and example code to help you get started.
- `docs`: Some custom code for the Attributes documentation website, which is hosted on Webflow.

## License

By contributing to Attributes, you agree that your contributions will be licensed under the [Apache 2.0 License](LICENSE.md).
