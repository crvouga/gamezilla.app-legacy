module ReviewConfig exposing (config)

import NoDeprecated
import NoDebug.Log
import NoDebug.TodoOrToString
import NoExposingEverything
import NoImportingEverything
import NoMissingTypeAnnotation
import NoMissingTypeAnnotationInLetIn
import NoUnoptimizedRecursion
import Review.Rule exposing (Rule)





import NoMissingTypeExpose
import NoPrematureLetComputation


elmReviewCommon : List Rule
elmReviewCommon =
    [ NoExposingEverything.rule
    , NoImportingEverything.rule []
    , NoMissingTypeAnnotation.rule
    , NoMissingTypeAnnotationInLetIn.rule
    , NoMissingTypeExpose.rule
    , NoPrematureLetComputation.rule
    ]


elmReviewDebug : List Rule
elmReviewDebug =
    [ NoDebug.Log.rule
    , NoDebug.TodoOrToString.rule
    ]


elmReviewBonus : List Rule
elmReviewBonus =
    [ NoUnoptimizedRecursion.rule (NoUnoptimizedRecursion.optOutWithComment "Ignore Tail-Call Optimization")
    ]


config : List Rule
config =
    elmReviewCommon
        ++ elmReviewDebug
        ++ elmReviewBonus
