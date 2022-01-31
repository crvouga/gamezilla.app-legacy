import { Link as MuiLink, LinkProps, LinkBaseProps } from "@mui/material";
import { Link as ReactLoactionLink } from "react-location";
import React from "react";

export const LinkBehavior = React.forwardRef<any, Partial<LinkBaseProps>>(
  (props, _ref) => {
    return (
      <ReactLoactionLink to={props.href} {...props}>
        {props.children}
      </ReactLoactionLink>
    );
  }
);

export const Link = (props: LinkProps) => {
  return <MuiLink component={LinkBehavior} {...props} />;
};
