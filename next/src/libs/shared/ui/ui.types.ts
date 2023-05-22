export type Padding = 0 | 0.5 | 1 | 2 | 3 | 4 | 5;

export type Style = {
  p: Padding;
  px: Padding;
  py: Padding;
  w: string | number;
  h: string | number;
  d: 'flex';
  flexDirection: 'row' | 'column';
  alignItems: 'center' | 'start' | 'end';
  justifyContent: 'center' | 'start' | 'end';
  textColor: 'primary' | 'text' | 'background';
  textSize: 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
};

export type Events = {
  onPress: () => void;
};

export type Theme = {
  primary: string;
};

export type Ctx = {
  theme: Theme;
};

export type Components<T> = {
  btn: (props: Partial<Style & Events>, text: string) => T;
  text: (props: Partial<Style & Events>, text: string) => T;
  box: (props: Partial<Style & Events>, children: T[]) => T;
};

export const view = <T>({ ui }: { ui: Components<T>; model: number }) => {
  const { box, text, btn } = ui;
  return box(
    { w: '100%', h: '100%', d: 'flex', flexDirection: 'column', p: 2 },
    [
      text({ textSize: 'xl' }, 'Sign in with'),
      text({ textSize: 'xl', textColor: 'primary' }, 'Gamezilla'),
      box({}, [btn({}, 'Sign in with google')]),
    ]
  );
};

type Props = Partial<Style & Events>;

type Node =
  | ['btn', Props, string]
  | ['box', Props, Node[]]
  | ['text', Props, string];

export const render = (node: Node) => {
  switch (node[0]) {
    case 'box': {
      return;
    }

    case 'btn': {
      return;
    }

    case 'text': {
      return;
    }
  }
};
