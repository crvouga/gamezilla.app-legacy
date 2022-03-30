import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import constate from "constate";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { Appbar, Avatar, List, TextInput } from "react-native-paper";
import {
  ALL_AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarSeed,
  toAvatarUrl,
} from "../../../../common";
import { Button, spacing } from "../../../ui";
import { createEventEmitter, useEventHandler } from "../../../utils";
import { dataAccess } from "./profile-update-data-access";

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

type IScreenProps<TKey extends keyof IStackParamList> = NativeStackScreenProps<
  IStackParamList,
  TKey
>;

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

type IProfileUpdateProps = {
  profile: {
    userId: string;
    username: string;
    avatarUrl: string;
    name: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
};

const [ProfileUpdateContext, useProfileUpdateContext] = constate(
  (context: IProfileUpdateProps) => {
    return context;
  }
);

export const ProfileUpdate = (props: IProfileUpdateProps) => {
  return (
    <ProfileUpdateContext {...props}>
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
    </ProfileUpdateContext>
  );
};

export const ProfileScreen = ({ navigation }: IScreenProps<"Profile">) => {
  const { profile, onSuccess, onCancel } = useProfileUpdateContext();

  const [formStatus, setFormStatus] = useState<"idle" | "loading">("idle");
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const parsed = parseAvatarUrl(profile.avatarUrl);
  const [avatarSeed, setAvatarSeed] = useState(parsed.avatarSeed);
  const [avatarStyle, setAvatarStyle] = useState(parsed.avatarStyle);

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

    const result = await dataAccess.update({
      userId: profile.userId,
      avatarUrl: toAvatarUrl({ avatarSeed, avatarStyle }),
      name,
      username,
    });

    if (result.type === "success") {
      onSuccess();
    }

    setFormStatus("idle");
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={onCancel} />
        <Appbar.Content title="Update Profile" />
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
          title="Update Profile"
          loadingText="Updating..."
          style={{
            marginBottom: spacing(2),
          }}
          mode="contained"
        />
      </View>
    </>
  );
};

export const AvatarScreen = ({ navigation, route }: IScreenProps<"Avatar">) => {
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
        title="Done"
      />
    </>
  );
};

const AvatarStyleScreen = ({
  navigation,
  route,
}: IScreenProps<"AvatarStyle">) => {
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
