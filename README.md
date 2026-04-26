# Flanksource Icons

A collection of SVG icons used across Flanksource projects.

**[Browse Icons Demo](https://flanksource.github.io/flanksource-icons/)**

## Prerequisites

Before running the SVG optimizer, ensure you have the following tools installed:
- `rsvg-convert`
- `svgo`

## Adding Icons

Download the new icons into `svg/`.

Run:

```sh
make svg/<new-icon.svg>
```

## Local Demo

Generate the icons list and open the demo locally:

```sh
make demo
open demo.html
```
