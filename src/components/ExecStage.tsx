/* eslint-disable react/no-danger */

import React, { useState, useMemo, useCallback } from 'react'
import {
  getTheme,
  Icon,
  CompoundButton,
  HoverCard,
  HoverCardType,
} from '@fluentui/react'
import _ from 'lodash'
import bytes from 'bytes'
import useAsyncEffect from 'use-async-effect'

import { ExecStats } from '@/types'
import { stringify } from '@/utils/mongo-shell-data'
import { colorize } from '@/utils/editor'
import { useDarkMode } from '@/utils/theme'
import { Number } from '@/utils/formatter'

export function ExecStage(props: { value: ExecStats }) {
  const theme = getTheme()
  const isDarkMode = useDarkMode()
  const str = useMemo(
    () => stringify(_.omit(props.value, ['inputStage', 'inputStages']), 2),
    [props.value],
  )
  const [html, setHtml] = useState(str)
  useAsyncEffect(
    async (isMounted) => {
      const _html = await colorize(str, isDarkMode)
      if (isMounted()) {
        setHtml(_html)
      }
    },
    [str, isDarkMode],
  )
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
  }, [html])

  return (
    <>
      <HoverCard
        type={HoverCardType.plain}
        plainCardProps={{ onRenderPlainCard }}
        styles={{
          host: {
            display: 'inherit',
            cursor: 'pointer',
          },
        }}
        instantOpenOnClick={true}>
        <CompoundButton
          styles={{
            description: {
              whiteSpace: 'pre',
              lineHeight: '1.2em',
            },
            root: {
              paddingTop: 10,
              paddingBottom: 10,
              minHeight: 'unset',
              height: 'fit-content',
            },
          }}
          secondaryText={_.compact([
            `${Number.format(
              props.value.executionTimeMillisEstimate -
                (props.value.inputStage?.executionTimeMillisEstimate ||
                  Math.max(
                    props.value.inputStages?.[0].executionTimeMillisEstimate ||
                      0,
                    props.value.inputStages?.[1].executionTimeMillisEstimate ||
                      0,
                  ) ||
                  0),
            )} ms`,
            props.value.keysExamined === undefined
              ? undefined
              : `${Number.format(props.value.keysExamined)} keys examined`,
            props.value.docsExamined === undefined
              ? undefined
              : `${Number.format(props.value.docsExamined)} docs examined`,
            props.value.nMatched === undefined
              ? undefined
              : `${Number.format(props.value.nMatched)} matched`,
            props.value.memUsage === undefined
              ? undefined
              : `${bytes(props.value.memUsage, {
                  unitSeparator: ' ',
                }).toLocaleLowerCase()} mem used`,
            `${Number.format(props.value.nReturned)} returned`,
          ]).join('\n')}>
          {props.value.stage}
        </CompoundButton>
      </HoverCard>
      {props.value.inputStage ? (
        <>
          <Icon
            iconName="Forward"
            styles={{
              root: {
                color: theme.palette.neutralPrimary,
                margin: 8,
              },
            }}
          />
          <ExecStage value={props.value.inputStage} />
        </>
      ) : null}
      {props.value.inputStages ? (
        <>
          <Icon
            iconName="Forward"
            styles={{
              root: {
                color: theme.palette.neutralPrimary,
                margin: 8,
              },
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}>
            {props.value.inputStages.map((inputStage, index) => (
              <div
                key={index.toString()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row-reverse',
                  marginTop: index === 0 ? 0 : 34,
                }}>
                <ExecStage value={inputStage} />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}
