import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import constate from "constate";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { Avatar, List, TextInput } from "react-native-paper";
import {
  AppBarAction,
  AppBarContent,
  AppBarHeader,
  Button,
  spacing,
} from "../../ui";
import { createEventEmitter, useEventHandler } from "../../utils";
import {
  ALL_AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  toAvatarSeed,
  toAvatarUrl,
} from "../profile-avatar";
import { dataAccess } from "./profile-create-data-access";

type IStackParamList = {
  Profile: undefined;
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
}>();

const [ProfileCreateContext, useProfileCreateContext] = constate(
  (props: { userId: string; defaultName: string; onLogout: () => void }) => {
    return props;
  }
);

export const ProfileCreate = (props: {
  userId: string;
  defaultName: string;
  onLogout: () => void;
}) => {
  return (
    <ProfileCreateContext {...props}>
      <Stack.Navigator
        initialRouteName="Profile"
        screenOptions={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      >
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Avatar" component={AvatarScreen} />
        <Stack.Screen name="AvatarStyle" component={AvatarStyleScreen} />
      </Stack.Navigator>
    </ProfileCreateContext>
  );
};

export const ProfileScreen = ({
  navigation,
}: NativeStackScreenProps<IStackParamList, "Profile">) => {
  const { userId, defaultName, onLogout } = useProfileCreateContext();

  const [formStatus, setFormStatus] = useState<"idle" | "loading">("idle");
  const [name, setName] = useState(defaultName);
  const [username, setUsername] = useState(
    defaultName.replace(" ", "").toLowerCase()
  );
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
      userId,
      avatarUrl: toAvatarUrl({ avatarSeed, avatarStyle }),
      name,
      username,
    });
  };

  return (
    <>
      <AppBarHeader>
        <AppBarAction icon="logout" onPress={onLogout} />
        <AppBarContent title="Create Profile" />
      </AppBarHeader>

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
          loadingText="Creating..."
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
      <AppBarHeader>
        <AppBarAction icon="close" onPress={navigation.goBack} />
        <AppBarContent title="Avatar" />
      </AppBarHeader>

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
        title="Done"
      />
    </>
  );
};

const AvatarStyleScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<IStackParamList, "AvatarStyle">) => {
  const handleSubmit = (avatarStyle: IAvatarStyle) => () => {
    eventEmitter.emit("AVATAR_STYLE_FORM_SUBMITTED", {
      avatarStyle,
    });

    navigation.goBack();
  };

  return (
    <>
      <AppBarHeader>
        <AppBarAction
          icon="close"
          onPress={() => {
            navigation.goBack();
          }}
        />
        <AppBarContent title="Avatar Style" />
      </AppBarHeader>

      <FlatList
        data={ALL_AVATAR_STYLES}
        renderItem={({ item }) => (
          <List.Item
            onPress={handleSubmit(item)}
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
