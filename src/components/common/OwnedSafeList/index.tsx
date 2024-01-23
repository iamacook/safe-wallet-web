import React, { useCallback, useMemo, useState } from 'react'
import SafeListItem from '@/components/sidebar/SafeListItem'
import useAllOwnedSafes from '@/hooks/useOwnedSafes'
import { IconButton, List, Typography } from '@mui/material'
import css from './styles.module.css'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'

const maxSafes = 3

const OwnedSafeList = ({ closeDrawer }: { closeDrawer?: () => void }) => {
  const [lastChainId, setLastChainId] = useState<string | undefined>()
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false)
  const router = useRouter()

  const [safes] = useAllOwnedSafes(isListExpanded ? Infinity : maxSafes, lastChainId)

  const isWelcomePage = router.pathname === AppRoutes.welcome.index || router.pathname === AppRoutes.welcome.socialLogin
  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  const safesToShow = useMemo(() => {
    return [safes.slice(0, maxSafes), safes.slice(maxSafes)]
  }, [safes])

  const onShowMore = useCallback(() => {
    if (safes.length > 0) {
      setLastChainId(safes[safes.length - 1].chain.chainId)
      setIsListExpanded((prev) => !prev)
    }
  }, [safes])

  const getHref = useCallback(
    (chain: ChainInfo, address: string) => {
      return {
        pathname: isWelcomePage ? AppRoutes.home : isSingleTxPage ? AppRoutes.transactions.history : router.pathname,
        query: { ...router.query, safe: `${chain.shortName}:${address}` },
      }
    },
    [isWelcomePage, isSingleTxPage, router.pathname, router.query],
  )

  return (
    <>
      <List className={css.list}>
        {safesToShow[0].map(({ safeAddress, chain }) => {
          const href = getHref(chain, safeAddress)
          return (
            <SafeListItem
              key={chain.chainId + safeAddress}
              address={safeAddress}
              chainId={chain.chainId}
              closeDrawer={closeDrawer}
              href={href}
              shouldScrollToSafe={false}
              isAdded
              isWelcomePage={true}
            />
          )
        })}
      </List>

      {!isListExpanded && (
        <div className={css.ownedLabelWrapper} onClick={onShowMore}>
          <Typography variant="body2" display="inline" className={css.ownedLabel}>
            More Accounts
            <IconButton disableRipple>
              <ExpandMore />
            </IconButton>
          </Typography>
        </div>
      )}

      {!!lastChainId && (
        <List className={css.list}>
          {safesToShow[1].map(({ safeAddress, chain }) => {
            const href = getHref(chain, safeAddress)
            return (
              <SafeListItem
                key={chain.chainId + safeAddress}
                address={safeAddress}
                chainId={chain.chainId}
                closeDrawer={closeDrawer}
                href={href}
                shouldScrollToSafe={false}
                isAdded
                isWelcomePage={true}
              />
            )
          })}
        </List>
      )}
    </>
  )
}

export default OwnedSafeList
