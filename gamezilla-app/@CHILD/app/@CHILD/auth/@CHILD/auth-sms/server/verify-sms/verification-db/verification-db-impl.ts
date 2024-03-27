import { VerificationAttemptDb, VerificationDb } from "./verification-db"
import { VerficationDbHashMap } from "./verification-db-impl-hash-map"

export type Impl = {
  t: "hash-map"
}

export const VerficationDb = (impl: Impl): VerificationDb => {
  switch (impl.t) {
    case "hash-map": {
      return VerficationDbHashMap()
    }
  }
}

export const VerficationAttemptsDbHashMap = (
  impl: Impl,
): VerificationAttemptDb => {
  switch (impl.t) {
    case "hash-map": {
      return VerficationDbHashMap()
    }
  }
}
