# Analytics Plugin for Yandex Metrika

## Overview

This plugin integrates Yandex Metrika into your project, allowing to track user interactions and events.

## Installation
1. `npm i @hexlet/analytics-plugin-yandex-metrika`
2. In `analytics` init, add YandexMetrika in the plugins array. Example config:
```js
import Analytics from 'analytics';
import yandexMetrika from '@hexlet/analytics-plugin-yandex-metrika';

const analytics = Analytics({
  app: 'example',
  plugins: [
    yandexMetrika({
      counterId: YANDEX_METRIKA_CLIENT_ID,
      enabled,
    }),
  ],
});

export default analytics;
```

## Usage

Add plugin to analytics.js following this guide — https://getanalytics.io/plugins/#installation--usage

You can use default behavior of all Analytics plugins and then all user traits will

```js
analytics.identify(userId)
```
