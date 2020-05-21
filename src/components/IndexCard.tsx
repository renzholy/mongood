import React from 'react'
import { Card } from '@uifabric/react-cards'
import {
  Text,
  FontWeights,
  Icon,
  getTheme,
  TooltipHost,
  TooltipDelay,
} from '@fluentui/react'
import _ from 'lodash'
import { EJSON } from 'bson'

import { Index } from '@/types'

export function IndexCard(props: {
  selected?: boolean
  onSelect?(): void
  value: Index
}) {
  const theme = getTheme()
  const showTitle =
    props.value.background ||
    props.value.unique ||
    props.value.sparse ||
    props.value.partialFilterExpression ||
    props.value.expireAfterSeconds

  return (
    <Card
      horizontal={true}
      onClick={props.onSelect}
      styles={{
        root: {
          alignItems: 'center',
          userSelect: 'none',
          borderLeft: `2px solid ${
            props.selected ? theme.palette.themePrimary : 'transparent'
          }`,
          backgroundColor: props.selected
            ? theme.palette.neutralLighter
            : 'transparent',
        },
      }}
      tokens={{
        childrenMargin: 10,
        minWidth: 'unset',
        maxWidth: 'unset',
      }}>
      <Card.Section>
        <Text
          block={true}
          variant="medium"
          styles={{
            root: {
              color: theme.palette.themePrimary,
              fontWeight: FontWeights.semibold,
            },
          }}>
          {props.value.name}
        </Text>
      </Card.Section>
      <Card.Section
        styles={{
          root: { borderLeft: '1px solid #F3F2F1', paddingLeft: 10 },
        }}>
        <TooltipHost
          delay={TooltipDelay.zero}
          tooltipProps={{
            onRenderContent() {
              return (
                <Card
                  styles={{ root: { margin: -6 } }}
                  tokens={{
                    childrenMargin: 10,
                    maxWidth: 'unset',
                  }}>
                  <Card.Item>
                    {showTitle ? (
                      <Text
                        styles={{ root: { fontWeight: FontWeights.semibold } }}>
                        {_.compact([
                          props.value.background ? 'background' : null,
                          props.value.unique ? 'unique' : null,
                          props.value.sparse ? 'sparse' : null,
                          props.value.partialFilterExpression
                            ? 'partial'
                            : null,
                          props.value.expireAfterSeconds ? 'expire' : null,
                        ]).join(', ')}
                      </Text>
                    ) : null}
                  </Card.Item>
                  <Card.Section
                    styles={{
                      root: showTitle
                        ? {
                            borderTop: '1px solid #F3F2F1',
                          }
                        : {},
                    }}>
                    <Text>
                      <pre>
                        {JSON.stringify(
                          EJSON.parse(JSON.stringify(props.value)),
                          null,
                          2,
                        )}
                      </pre>
                    </Text>
                  </Card.Section>
                </Card>
              )
            },
          }}>
          <Icon
            iconName="MoreVertical"
            styles={{
              root: {
                color: theme.palette.neutralPrimary,
                fontSize: 16,
                fontWeight: FontWeights.regular,
              },
            }}
          />
        </TooltipHost>
      </Card.Section>
    </Card>
  )
}
