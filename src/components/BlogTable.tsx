import {Link} from "gatsby"
import * as React from "react"
import {DateUtils} from "../DateUtils"
import {
    createStyles,
    Paper,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TablePagination,
    TableRow,
    Theme,
    Typography,
} from "@mui/material";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";

const StyledTableCell = styled(TableCell)((theme: Theme) =>
    createStyles({
        head: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        body: {
            fontSize: 14,
        },
    })
)

const StyledTableRow = styled(TableRow)((theme: Theme) =>
    createStyles({
        root: {
            "&:nth-of-type(odd)": {
                backgroundColor: theme.palette.action.hover,
            },
        },
    })
)

interface BlogArticleTableProps {
    posts: Blog[]
}

export interface Blog {
    blogsId: string
    title: string
    publishedAt: string
}

const BlogTable: React.FC<BlogArticleTableProps> = ({posts}) => {
    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(10)

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    return (
        <>
            <TableContainer component={Paper}></TableContainer>
            <Table size="small">
                <TableBody>
                    {(rowsPerPage > 0
                            ? posts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : posts
                    ).map(post => {
                        const title = post.title || post.blogsId
                        const publishedDate = DateUtils.formatDate(
                            new Date(Date.parse(post.publishedAt)),
                            "YYYY年MM月DD日 hh:mm"
                        )

                        return (
                            <>
                                <StyledTableRow key={post.blogsId}>
                                    <StyledTableCell align="left">
                                        <Typography
                                            variant="body1"
                                            color="textPrimary"
                                            component="p"
                                        >
                                            <Link
                                                to={`/blog/${post.blogsId}`}
                                                rel="noreferrer noopener"
                                                target="_blank"
                                            >
                                                {title}
                                            </Link>
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            component="p"
                                        >
                                        </Typography>
                                    </StyledTableCell>
                                </StyledTableRow>
                            </>
                        )
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, {label: "All", value: -1}]}
                            colSpan={3}
                            count={posts.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            SelectProps={{
                                inputProps: {"aria-label": "rows per page"},
                                native: true,
                            }}
                            onChangePage={handleChangePage}
                            onChangeRowsPerPage={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </>
    )
}

export default BlogTable
