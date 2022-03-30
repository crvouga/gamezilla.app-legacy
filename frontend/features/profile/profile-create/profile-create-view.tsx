import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { Appbar, Avatar, List, Portal, TextInput } from "react-native-paper";
import {
  ALL_AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  toAvatarSeed,
  toAvatarUrl,
} from "../../../../common";
import { Button, spacing } from "../../../ui";
import { DialogLoading } from "../../../ui/DialogLoading";
import { createEventEmitter, useEventHandler } from "../../../utils";
import { dataAccess } from "./profile-create-data-access";

type IStackParamList = {
  Profile: {
    userId: string;
    defaultName: string;
  };
  Avatar: {
    avatarStyle: IAvatarStyle;
    avatarSeed: IAvatarSeed;
  };
  AvatarStyle: {
    avatarSeed: IAvatarSeed;
  };
};

const Stack = createNativeStackNavigator<IStackParamList>();

const eventEmitter = createEventEmitter<{
  AVATAR_STYLE_FORM_SUBMITTED: {
    avatarStyle: IAvatarStyle;
  };
  AVATAR_FORM_SUBMITTED: {
    avatarStyle: IAvatarStyle;
    avatarSeed: IAvatarSeed;
  };
  LOGGED_OUT: {};
}>();

export const ProfileCreateView = ({
  onLogout,
  defaultName,
  userId,
}: {
  userId: string;
  defaultName: string;
  onLogout: () => void;
}) => {
  useEventHandler(eventEmitter, "LOGGED_OUT", onLogout);

  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{ headerShown: false, presentation: "fullScreenModal" }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{
          userId,
          defaultName,
        }}
      />
      <Stack.Screen name="Avatar" component={AvatarScreen} />
      <Stack.Screen name="AvatarStyle" component={AvatarStyleScreen} />
    </Stack.Navigator>
  );
};

export const ProfileScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<IStackParamList, "Profile">) => {
  const [formStatus, setFormStatus] = useState<"idle" | "loading">("idle");
  const [name, setName] = useState(route.params.defaultName);
  const [username, setUsername] = useState(route.params.defaultName);
  const [avatarSeed, setAvatarSeed] = useState<IAvatarSeed>(
    toAvatarSeed("string")
  );
  const [avatarStyle, setAvatarStyle] = useState<IAvatarStyle>("adventurer");

  useEventHandler(
    eventEmitter,
    "AVATAR_FORM_SUBMITTED",
    ({ avatarSeed, avatarStyle }) => {
      setAvatarSeed(avatarSeed);
      setAvatarStyle(avatarStyle);
    }
  );

  const onChangeAvatar = () => {
    navigation.navigate("Avatar", {
      avatarSeed,
      avatarStyle,
    });
  };

  const onSubmit = async () => {
    setFormStatus("loading");

    await dataAccess.create({
      userId: route.params.userId,
      avatarUrl: toAvatarUrl({ avatarSeed, avatarStyle }),
      name,
      username,
    });

    setFormStatus("idle");
  };

  const onLogout = () => {
    eventEmitter.emit("LOGGED_OUT", {});
  };

  return (
    <>
      <Portal>
        <DialogLoading
          visible={formStatus === "loading"}
          title="Creating profile..."
        />
      </Portal>

      <Appbar.Header>
        <Appbar.Action icon="logout" onPress={onLogout} />
        <Appbar.Content title="Create Profile" />
      </Appbar.Header>

      <Avatar.Image
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: spacing(2),
          marginBottom: spacing(2),
        }}
        size={144}
        source={{
          uri: toAvatarUrl({ avatarSeed, avatarStyle }),
        }}
      />

      <View
        style={{
          marginHorizontal: spacing(2),
        }}
      >
        <Button
          style={{
            marginBottom: spacing(2),
          }}
          onPress={onChangeAvatar}
          title={"Change Avatar"}
          mode="outlined"
        />

        <TextInput
          style={{
            marginBottom: spacing(2),
          }}
          mode="outlined"
          label="Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={{
            marginBottom: spacing(4),
          }}
          mode="outlined"
          label="Username"
          value={username}
          onChangeText={setUsername}
        />

        <Button
          onPress={onSubmit}
          loading={formStatus === "loading"}
          title="Create Profile"
          style={{
            marginBottom: spacing(2),
          }}
          mode="contained"
        />
      </View>
    </>
  );
};

export const AvatarScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<IStackParamList, "Avatar">) => {
  const [avatarSeed, setAvatarSeed] = useState<IAvatarSeed>(
    route.params.avatarSeed
  );

  const [avatarStyle, setAvatarStyle] = useState<IAvatarStyle>(
    route.params.avatarStyle
  );

  useEventHandler(
    eventEmitter,
    "AVATAR_STYLE_FORM_SUBMITTED",
    ({ avatarStyle }) => {
      setAvatarStyle(avatarStyle);
    }
  );

  const onChangeAvatar = () => {
    eventEmitter.emit("AVATAR_FORM_SUBMITTED", {
      avatarSeed,
      avatarStyle,
    });
    navigation.goBack();
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="close" onPress={navigation.goBack} />
        <Appbar.Content title="Avatar" />
      </Appbar.Header>

      <Avatar.Image
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: spacing(2),
          marginBottom: spacing(2),
        }}
        size={144}
        source={{
          uri: toAvatarUrl({ avatarSeed, avatarStyle }),
        }}
      />

      <Button
        style={{
          marginHorizontal: spacing(2),
          marginBottom: spacing(2),
        }}
        mode="outlined"
        onPress={() => {
          navigation.navigate("AvatarStyle", { avatarSeed });
        }}
        title="Change Style"
      />

      <TextInput
        style={{
          marginHorizontal: spacing(2),
          marginBottom: spacing(2),
        }}
        mode="outlined"
        label="Avatar Seed"
        value={avatarSeed}
        onChangeText={(text) => {
          setAvatarSeed(toAvatarSeed(text));
        }}
      />

      <Button
        style={{
          marginHorizontal: spacing(2),
          marginBottom: spacing(4),
        }}
        mode="outlined"
        onPress={() => {
          setAvatarSeed(toAvatarSeed(String(Math.random())));
        }}
        title="Generate Seed"
      />

      <Button
        style={{
          marginHorizontal: spacing(2),
          marginBottom: spacing(2),
        }}
        mode="contained"
        onPress={onChangeAvatar}
        title="Change Avatar"
      />
    </>
  );
};

const AvatarStyleScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<IStackParamList, "AvatarStyle">) => {
  return (
    <>
      <Appbar.Header>
        <Appbar.Action
          icon="close"
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content title="Avatar Style" />
      </Appbar.Header>

      <FlatList
        data={ALL_AVATAR_STYLES}
        renderItem={({ item }) => (
          <List.Item
            onPress={() => {
              eventEmitter.emit("AVATAR_STYLE_FORM_SUBMITTED", {
                avatarStyle: item,
              });

              navigation.goBack();
            }}
            left={() => (
              <Avatar.Image
                style={{ backgroundColor: "transparent" }}
                source={{
                  uri: toAvatarUrl({
                    avatarStyle: item,
                    avatarSeed: route.params.avatarSeed,
                  }),
                }}
              />
            )}
            title={formatAvatarStyle(item)}
          />
        )}
        keyExtractor={(item) => item}
      />
    </>
  );
};
