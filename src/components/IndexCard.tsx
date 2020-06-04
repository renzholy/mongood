/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-indent */

import React, { useCallback, useState, useEffect, useMemo } from 'react'
import { Card } from '@uifabric/react-cards'
import {
  Text,
  getTheme,
  Icon,
  Stack,
  HoverCard,
  HoverCardType,
  IconButton,
  Dialog,
  DialogType,
  DialogFooter,
  DefaultButton,
} from '@fluentui/react'
import _ from 'lodash'
import bytes from 'bytes'
import { IndexSpecification, WiredTigerData } from 'mongodb'

import { colorize } from '@/utils/editor'
import { useDarkMode } from '@/utils/theme'
import { runCommand } from '@/utils/fetcher'
import { useSelector } from 'react-redux'

function IndexInfo(props: { value: IndexSpecification }) {
  const theme = getTheme()

  return (
    <Stack horizontal={true} tokens={{ childrenGap: 10 }}>
      {'textIndexVersion' in props.value
        ? _.map(props.value.weights, (v, k) => (
            <Text
              key={k}
              styles={{
                root: { display: 'flex', alignItems: 'center' },
              }}>
              {k}:&nbsp;
              {v}
            </Text>
          ))
        : _.map(props.value.key, (v, k) => (
            <Text
              key={k}
              styles={{
                root: {
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.neutralPrimaryAlt,
                },
              }}>
              {k}:&nbsp;
              {v === 1 ? (
                <Icon
                  iconName="Up"
                  styles={{
                    root: { color: theme.palette.neutralPrimaryAlt },
                  }}
                />
              ) : (
                <Icon
                  iconName="Down"
                  styles={{
                    root: { color: theme.palette.neutralPrimaryAlt },
                  }}
                />
              )}
            </Text>
          ))}
    </Stack>
  )
}

function IndexFeature(props: { value: { text: string; data?: object } }) {
  const theme = getTheme()
  const isDarkMode = useDarkMode()
  const str = JSON.stringify(props.value.data, null, 2)
  const [html, setHtml] = useState(str)
  useEffect(() => {
    colorize(str, isDarkMode).then(setHtml)
  }, [str, isDarkMode])
  const onRenderPlainCard = useCallback(() => {
    return (
      <div
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          maxWidth: 500,
          maxHeight: 500,
          overflowY: 'scroll',
          backgroundColor: theme.palette.neutralLighterAlt,
        }}>
        <pre
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    )
  }, [html, theme])

  return (
    <HoverCard
      key={props.value.text}
      type={HoverCardType.plain}
      plainCardProps={{
        onRenderPlainCard,
      }}
      styles={{
        host: {
          display: 'inherit',
          cursor: 'pointer',
        },
      }}
      instantOpenOnClick={true}>
      <Text
        styles={{
          root: {
            color: theme.palette.neutralSecondary,
          },
        }}>
        {props.value.text}
      </Text>
    </HoverCard>
  )
}

function IndexDrop(props: { value: IndexSpecification; onDrop(): void }) {
  const theme = getTheme()
  const [hidden, setHidden] = useState(true)
  const { database, collection } = useSelector((state) => state.root)
  const handleDropIndex = useCallback(async () => {
    if (!database || !collection) {
      return
    }
    await runCommand(database, {
      dropIndexes: collection,
      index: props.value.name,
    })
    setHidden(true)
    props.onDrop()
  }, [database, collection, props.value])

  return (
    <>
      <Dialog
        hidden={hidden}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Drop index',
          subText: props.value.name,
          onDismiss() {
            setHidden(true)
          },
        }}
        modalProps={{
          styles: {
            main: {
              minHeight: 0,
              borderTop: `4px solid ${theme.palette.yellow}`,
              backgroundColor: theme.palette.neutralLighterAlt,
            },
          },
          onDismiss() {
            setHidden(true)
          },
        }}>
        <DialogFooter>
          <DefaultButton onClick={handleDropIndex} text="Drop" />
        </DialogFooter>
      </Dialog>
      <IconButton
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{
          alignTargetEdge: true,
          items: [
            {
              key: 'Drop index',
              text: 'Drop index',
              onClick() {
                setHidden(false)
              },
            },
          ],
        }}
        styles={{ root: { color: theme.palette.themePrimary } }}
      />
    </>
  )
}

export function IndexCard(props: {
  value: IndexSpecification
  onDrop(): void
  size: number
  statDetail: WiredTigerData
}) {
  const theme = getTheme()
  const features = useMemo(
    () =>
      _.compact([
        props.value.background ? { text: 'BACKGROUND' } : null,
        props.value.unique ? { text: 'UNIQUE' } : null,
        props.value.sparse ? { text: 'SPARSE' } : null,
        props.value.partialFilterExpression
          ? {
              text: 'PARTIAL',
              data: {
                partialFilterExpression: props.value.partialFilterExpression,
              },
            }
          : null,
        'expireAfterSeconds' in props.value
          ? {
              text: 'TTL',
              data: {
                expireAfterSeconds: props.value.expireAfterSeconds,
              },
            }
          : null,
        '2dsphereIndexVersion' in props.value
          ? {
              text: 'GEOSPATIAL',
              data: {
                '2dsphereIndexVersion': props.value['2dsphereIndexVersion'],
              },
            }
          : null,
        'textIndexVersion' in props.value
          ? {
              text: 'TEXT',
              data: {
                textIndexVersion: props.value.textIndexVersion,
                default_language: props.value.default_language,
                language_override: props.value.language_override,
                weights: props.value.weights,
              },
            }
          : null,
      ]),
    [props.value],
  )

  return (
    <Card
      horizontal={true}
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
        },
      }}
      tokens={{
        childrenGap: 10,
        padding: 20,
        minWidth: 676,
        minHeight: 'unset',
      }}>
      <Card.Section styles={{ root: { flex: 1 } }}>
        <Card.Item>
          <Text
            variant="xLarge"
            styles={{ root: { color: theme.palette.neutralPrimary } }}>
            {props.value.name}&nbsp;
          </Text>
          <Text styles={{ root: { color: theme.palette.neutralPrimaryAlt } }}>
            ({bytes(props.size, { unitSeparator: ' ' })})
          </Text>
        </Card.Item>
        <Card.Item>
          <IndexInfo value={props.value} />
        </Card.Item>
        {features.length ? (
          <Card.Item>
            <Stack horizontal={true} tokens={{ childrenGap: 10 }}>
              {features.map((feature) =>
                'data' in feature ? (
                  <IndexFeature key={feature.text} value={feature} />
                ) : (
                  <Text
                    key={feature.text}
                    styles={{
                      root: {
                        color: theme.palette.neutralSecondary,
                      },
                    }}>
                    {feature.text}
                  </Text>
                ),
              )}
            </Stack>
          </Card.Item>
        ) : null}
      </Card.Section>
      <Card.Section
        styles={{
          root: {
            alignSelf: 'flex-end',
            marginBottom: -10,
            marginRight: -10,
          },
        }}>
        <IndexDrop value={props.value} onDrop={props.onDrop} />
      </Card.Section>
    </Card>
  )
}
