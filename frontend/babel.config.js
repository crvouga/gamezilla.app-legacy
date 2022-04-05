module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      [
        "rename-jsx-attribute",
        {
          attributes: {
            onPress: "onClick",
          },
        },
      ],
    ],
  };
};
